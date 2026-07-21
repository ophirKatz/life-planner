import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { TaskListRow } from "@/modules/tasks/types";

export const taskListsKey = ["tasks", "lists"] as const;

export function useTaskLists() {
  return useQuery({
    queryKey: taskListsKey,
    queryFn: async (): Promise<TaskListRow[]> => {
      const { data, error } = await supabase.from("task_lists").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTaskList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<TaskListRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("task_lists")
        .insert({ name, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskListsKey }),
  });
}
