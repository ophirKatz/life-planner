import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import { emit } from "@/core/events/bus";
import type { TaskInsert, TaskRow, TaskUpdate } from "@/modules/tasks/types";

export const tasksKey = ["tasks"] as const;
export const taskKey = (id: string) => ["tasks", id] as const;

export function useTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("status", { ascending: true })
        .order("due_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKey(id),
    queryFn: async (): Promise<TaskRow> => {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TaskInsert, "user_id">): Promise<TaskRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TaskUpdate }): Promise<TaskRow> => {
      const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tasksKey });
      queryClient.invalidateQueries({ queryKey: taskKey(data.id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}

/** Swipe-to-complete: flips status/completed_at in one call. */
export function useToggleTaskDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TaskRow): Promise<TaskRow> => {
      const isDone = task.status === "done";
      const { data, error } = await supabase
        .from("tasks")
        .update({
          status: isDone ? "todo" : "done",
          completed_at: isDone ? null : new Date().toISOString(),
        })
        .eq("id", task.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tasksKey });
      emit({ type: "record.updated", entityType: "task", entityId: data.id, data: { status: data.status } });
    },
  });
}
