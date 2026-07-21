import { router } from "expo-router";
import { ListTodo } from "lucide-react-native";

import { taskScheduledAsAutomation } from "@/modules/tasks/automations";
import { TasksWidget } from "@/modules/tasks/components/TasksWidget";
import { listAllTasks, resolveTask } from "@/modules/tasks/linkable";
import type { ModuleDefinition } from "@/core/modules/types";

export const tasksModule: ModuleDefinition = {
  slug: "tasks",
  name: "Tasks",
  icon: ListTodo,
  tier: "free",
  routes: [{ path: "tasks", title: "Tasks" }],
  dashboardWidgets: [TasksWidget],
  quickAddActions: [
    {
      id: "tasks.new",
      label: "New task",
      icon: ListTodo,
      onPress: () => router.push("/modules/tasks/new"),
    },
  ],
  linkableEntities: [
    { type: "task", table: "tasks", label: "Task", resolve: resolveTask, listAll: listAllTasks },
  ],
  automations: [taskScheduledAsAutomation],
};
