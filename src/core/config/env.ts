import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_IOS_KEY: z.string().optional().default(""),
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: z.string().optional().default(""),
  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: z.string().optional().default(""),
});

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_REVENUECAT_IOS_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}. Copy .env.example to .env and fill in the required values.`
  );
}

export const env = {
  supabaseUrl: parsed.data.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsed.data.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  revenueCatIosKey: parsed.data.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  revenueCatAndroidKey: parsed.data.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  googleOAuthClientId: parsed.data.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
};
