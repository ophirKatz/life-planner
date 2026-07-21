import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ShoppingItemRow } from "@/modules/shopping/types";

export const shoppingItemsKey = (listId: string) => ["shopping", "items", listId] as const;

export function useShoppingItems(listId: string) {
  return useQuery({
    queryKey: shoppingItemsKey(listId),
    queryFn: async (): Promise<ShoppingItemRow[]> => {
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_id", listId)
        .order("checked", { ascending: true })
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
}

export function useAddShoppingItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<ShoppingItemRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");

      const { count } = await supabase
        .from("shopping_items")
        .select("id", { count: "exact", head: true })
        .eq("list_id", listId);

      const { data, error } = await supabase
        .from("shopping_items")
        .insert({ name, list_id: listId, user_id: auth.user.id, position: count ?? 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingItemsKey(listId) }),
  });
}

export function useToggleShoppingItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: ShoppingItemRow): Promise<ShoppingItemRow> => {
      const { data, error } = await supabase
        .from("shopping_items")
        .update({ checked: !item.checked })
        .eq("id", item.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingItemsKey(listId) }),
  });
}

export function useDeleteShoppingItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("shopping_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingItemsKey(listId) }),
  });
}

/** Swaps `position` with the given neighbor item (simple, dependency-free reorder). */
export function useSwapShoppingItemPosition(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ a, b }: { a: ShoppingItemRow; b: ShoppingItemRow }): Promise<void> => {
      const { error: e1 } = await supabase
        .from("shopping_items")
        .update({ position: b.position })
        .eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("shopping_items")
        .update({ position: a.position })
        .eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingItemsKey(listId) }),
  });
}
