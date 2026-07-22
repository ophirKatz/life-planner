import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { WishlistItemInsert, WishlistItemRow, WishlistItemUpdate } from "@/modules/wishlists/types";

export const wishlistItemsKey = ["wishlist-items"] as const;
export const wishlistItemKey = (id: string) => ["wishlist-items", id] as const;

export function useWishlistItems() {
  return useQuery({
    queryKey: wishlistItemsKey,
    queryFn: async (): Promise<WishlistItemRow[]> => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useWishlistItem(id: string) {
  return useQuery({
    queryKey: wishlistItemKey(id),
    queryFn: async (): Promise<WishlistItemRow> => {
      const { data, error } = await supabase.from("wishlist_items").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<WishlistItemInsert, "user_id">): Promise<WishlistItemRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("wishlist_items")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistItemsKey }),
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: WishlistItemUpdate }): Promise<WishlistItemRow> => {
      const { data, error } = await supabase.from("wishlist_items").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: wishlistItemsKey });
      queryClient.invalidateQueries({ queryKey: wishlistItemKey(data.id) });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistItemsKey }),
  });
}
