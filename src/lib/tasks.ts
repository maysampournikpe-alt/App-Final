export const TASKS_KEY = "todos";
export interface Task { id: string; title: string; done: boolean; urgent: boolean; important: boolean; top: boolean; created: string }
export const NO_TASKS: Task[] = [];

export type Quadrant = "do" | "plan" | "quick" | "drop";
export const quadrantOf = (t: Pick<Task, "urgent" | "important">): Quadrant =>
  t.urgent && t.important ? "do" : t.important ? "plan" : t.urgent ? "quick" : "drop";
export const QUADRANTS: Quadrant[] = ["do", "plan", "quick", "drop"];

/** Today's top priorities: at most three, never done tasks. */
export const MAX_TOP = 3;
export const topTasks = (tasks: Task[]) => tasks.filter((t) => t.top && !t.done);
export const canAddTop = (tasks: Task[]) => topTasks(tasks).length < MAX_TOP;
