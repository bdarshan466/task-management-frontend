export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'bug' | 'feature' | 'task';

export interface KanbanBoardTask {
  taskID: string;
  title: string;
  description: string;
  status: TaskStatus;
  teamID: string;
  priority: TaskPriority | 'medium';
  type: TaskType | 'feature';
  assignee?: {
    name: string;
    avatar?: string;
  };
  taskUniqueCode?: string;
}

export interface TaskModal {

  taskID: string;
  title: string;
  description: string | null; 
  taskUniqueCode: string;
  reporter: { userID: string, name: string }; 
  assignee?: { userID: string, name: string } | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate: string | null;
  comments?: {
    commentID: string;
    commentText: string;
    commenter: { userID: string, name: string };
    createdAt: string; 
    updatedAt: string;
    isUpdated: boolean;
  }[];
  createdAt: string; 
  updatedAt: string;
  estimatedMinutes: number; 
  actualTakenMinutes: number; 
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface KanbanBoardData {
  tasks: Record<string, KanbanBoardTask>;
  columns: Record<string, Column>;
  columnOrder: TaskStatus[];
}
