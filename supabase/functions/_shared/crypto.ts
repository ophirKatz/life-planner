// AES-256-GCM token encryption using the Web Crypto API (native in the Deno
// edge runtime — no extra dependency). TOKEN_ENCRYPTION_KEY is a 32-byte key,
// base64-encoded, set via `supabase secrets set` — never shipped to the client.
//
// Stored format: base64(iv[12 bytes] || ciphertext). iv is random per encrypt.

function getKeyMaterial(): Uint8Array {
  const b64 = Deno.env.get("TOKEN_ENCRYPTION_KEY");
  if (!b64) throw new Error("TOKEN_ENCRYPTION_KEY is not set.");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  if (bytes.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256).");
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", getKeyMaterial(), "AES-GCM", false, ["encrypt", "decrypt"]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptToken(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return toBase64(combined);
}

export async function decryptToken(stored: string): Promise<string> {
  const key = await getKey();
  const combined = fromBase64(stored);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
