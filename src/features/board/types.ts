export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'bug' | 'feature' | 'task';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  teamId?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: TaskStatus[];
}
