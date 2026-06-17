import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import type { KanbanBoardData, Column, KanbanBoardTask, TaskPriority, TaskStatus } from '../types';
import TaskService from '@/services/taskApi';

interface Props {
  selectedAssignee?: string | null;
  selectedStatusFilter?: string | null;
  selectedTeam?: string | null;
}

export default function KanbanBoard({ selectedAssignee, selectedStatusFilter, selectedTeam }: Props) {
  const [data, setData] = useState<KanbanBoardData>({
    tasks: {},
    columns: {
      'todo': { id: 'todo', title: 'TO DO', taskIds: [] },
      'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: [] },
      'done': { id: 'done', title: 'DONE', taskIds: [] }
    },
    columnOrder: ['todo', 'in-progress', 'done']
  });

  useEffect(() => {
    if (!selectedTeam) {
      setData({
        tasks: {},
        columns: {
          'todo': { id: 'todo', title: 'TO DO', taskIds: [] },
          'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: [] },
          'done': { id: 'done', title: 'DONE', taskIds: [] }
        },
        columnOrder: ['todo', 'in-progress', 'done']
      });
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await TaskService.fetchTaskListApi(selectedTeam);
        if (response) {
          // response from fetchTaskListApi is response.data (an array of tasks)
          const taskList = response;

          // 1. Initialize fresh, empty columns
          const newTasks: Record<string, KanbanBoardTask> = {};
          const newColumns: Record<TaskStatus, Column> = {
            'todo': { id: 'todo', title: 'TO DO', taskIds: [] },
            'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: [] },
            'done': { id: 'done', title: 'DONE', taskIds: [] }
          };

          // 2. Iterate through flat tasks and categorize them
          taskList.forEach((t: any) => {
            // Map API properties to frontend expected Task structure
            const mappedTask: KanbanBoardTask = {
              taskID: t.taskID,
              title: t.title,
              description: t.description,
              status: t.status as TaskStatus,
              teamID: t.teamID,
              assignee: t.primaryAssigned ? {
                name: t.primaryAssigned.name,
              } : undefined, 
              taskUniqueCode: t.taskUniqueCode || '',
              priority: t.priority as TaskPriority || 'medium',
              type: t.type || 'feature',
            };

            // Add task to the tasks map
            newTasks[mappedTask.taskID] = mappedTask;

            // Push task ID to its status column list
            if (newColumns[mappedTask.status]) {
              newColumns[mappedTask.status].taskIds.push(mappedTask.taskID);
            }
          });

          // 3. Set the state
          setData({
            tasks: newTasks,
            columns: newColumns,
            columnOrder: ['todo', 'in-progress', 'done']
          });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [selectedTeam]);


  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  }, [data]);


  return (
    <div className="h-full w-full overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full items-start">
          {!!data &&data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            
            // Filter tasks based on assignee, status, and team
            const tasks = column.taskIds
              .map((taskId) => data.tasks[taskId])
              .filter(task => {
                const matchesAssignee = !selectedAssignee || task.assignee?.name === selectedAssignee;
                const matchesStatus = !selectedStatusFilter || task.status === selectedStatusFilter;
                const matchesTeam = !selectedTeam || task.teamID === selectedTeam;
                return matchesAssignee && matchesStatus && matchesTeam;
              });

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
