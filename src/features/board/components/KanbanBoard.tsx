import { useState, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { initialBoardData } from '../data/mockData';
import KanbanColumn from './KanbanColumn';
import type { BoardData } from '../types';

interface Props {
  selectedAssignee?: string | null;
  selectedStatusFilter?: string | null;
  selectedTeam?: string | null;
}

export default function KanbanBoard({ selectedAssignee, selectedStatusFilter, selectedTeam }: Props) {
  const [data, setData] = useState<BoardData>(initialBoardData);

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
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            
            // Filter tasks based on assignee, status, and team
            const tasks = column.taskIds
              .map((taskId) => data.tasks[taskId])
              .filter(task => {
                const matchesAssignee = !selectedAssignee || task.assignee?.name === selectedAssignee;
                const matchesStatus = !selectedStatusFilter || task.status === selectedStatusFilter;
                const matchesTeam = !selectedTeam || task.teamId === selectedTeam;
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
