import type { BoardData } from '../types';

export const initialBoardData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Design Database Schema', status: 'done', priority: 'high', type: 'feature', teamId: 'team-1', assignee: { name: 'Alice' } },
    'task-2': { id: 'task-2', title: 'Setup Authentication API', status: 'in-progress', priority: 'high', type: 'task', teamId: 'team-1', assignee: { name: 'Bob' } },
    'task-3': { id: 'task-3', title: 'Implement Kanban UI', status: 'in-progress', priority: 'medium', type: 'feature', teamId: 'team-2', assignee: { name: 'Darshan' } },
    'task-4': { id: 'task-4', title: 'Fix login button alignment', status: 'todo', priority: 'low', type: 'bug', teamId: 'team-2' },
    'task-5': { id: 'task-5', title: 'Write unit tests for Auth', status: 'todo', priority: 'medium', type: 'task', teamId: 'team-3' },
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
