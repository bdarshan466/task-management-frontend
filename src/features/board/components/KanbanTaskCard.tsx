import { useSearchParams } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';
import { AlertCircle, CheckSquare, Bookmark, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  task: Task;
  index: number;
}

export default function KanbanTaskCard({ task, index }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCardClick = () => {
    searchParams.set('selectedIssue', task.taskID);
    setSearchParams(searchParams);
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'low': return <ArrowDown className="w-4 h-4 text-blue-500" />;
      case 'medium': return <ArrowRight className="w-4 h-4 text-orange-500" />;
      case 'high': return <ArrowUp className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeIcon = () => {
    switch (task.type) {
      case 'bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'feature': return <Bookmark className="w-4 h-4 text-green-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  console.log("task",task)
  return (
    <Draggable draggableId={task.taskID} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 focus:outline-none ${snapshot.isDragging ? 'opacity-90' : ''}`}
          onClick={handleCardClick}
        >
          <Card className={`border shadow-sm bg-card transition-shadow hover:ring-1 hover:ring-border cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}>
            <CardContent className="p-3 space-y-3">
              <p className="text-sm font-medium leading-[1.4] text-card-foreground">
                {task.title}
              </p>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center text-muted-foreground">
                    {getTypeIcon()}
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground">
                    {getPriorityIcon()}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">{task.taskUniqueCode}</span>
                </div>
                
                {task.assignee && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20" title={task.assignee.name}>
                    <span className="text-[10px] font-bold text-primary">{task.assignee.name.charAt(0)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
