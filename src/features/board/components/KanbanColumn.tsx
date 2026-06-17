import { Droppable } from '@hello-pangea/dnd';
import type { Column, KanbanBoardTask } from '../types';
import KanbanTaskCard from './KanbanTaskCard';

interface Props {
  column: Column;
  tasks: KanbanBoardTask[];
}

export default function KanbanColumn({ column, tasks }: Props) {
  return (
    <div className="flex flex-col flex-1 min-w-[300px] bg-[#F4F5F7] dark:bg-zinc-900 rounded-lg max-h-full">
      <div className="p-3 bg-[#F4F5F7] dark:bg-zinc-900 rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-muted-foreground shrink-0 uppercase tracking-wider">
            {column.title} <span className="ml-1 px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">{tasks.length}</span>
          </h3>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto transition-colors custom-scrollbar ${
              snapshot.isDraggingOver ? 'bg-zinc-200/50 dark:bg-zinc-800/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard key={task.taskID} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
