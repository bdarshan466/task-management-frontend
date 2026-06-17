import type { KanbanBoardData } from '../types';

export const initialBoardData: KanbanBoardData = {
  tasks: {
    '19b7163c-1393-408e-82b8-cf4ce56e4848': { 
      taskID: '19b7163c-1393-408e-82b8-cf4ce56e4848', 
      title: 'Design Database Schema', 
      description: 'Design Database Schema', 
      status: 'done', 
      priority: 'high', 
      type: 'feature', 
      teamID: 'team-1', 
      assignee: { name: 'Alice' } 
    },
    'task-2': { taskID: 'task-2', title: 'Setup Authentication API', description: 'Setup Authentication API', status: 'in-progress', priority: 'high', type: 'task', teamID: 'team-1', assignee: { name: 'Bob' } },
    'task-3': { taskID: 'task-3', title: 'Implement Kanban UI', description: 'Implement Kanban UI', status: 'in-progress', priority: 'medium', type: 'feature', teamID: 'team-2', assignee: { name: 'Darshan' } },
    'task-4': { taskID: 'task-4', title: 'Fix login button alignment', description: 'Fix login button alignment', status: 'todo', priority: 'low', type: 'bug', teamID: 'team-2' },
    'task-5': { taskID: 'task-5', title: 'Write unit tests for Auth', description: 'Write unit tests for Auth', status: 'todo', priority: 'medium', type: 'task', teamID: 'team-3' },
  },
  columns: {
    'todo': {
      id: 'todo',
      title: 'TODO',
      taskIds: ['task-4', 'task-5'],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'IN PROGRESS',
      taskIds: ['task-2', 'task-3'],
    },
    'done': {
      id: 'done',
      title: 'DONE',
      taskIds: ['task-1'],
    },
  },
  columnOrder: ['todo', 'in-progress', 'done'],
};
