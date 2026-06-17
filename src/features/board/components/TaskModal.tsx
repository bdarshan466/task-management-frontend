import { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Trash2, AlertCircle, CheckSquare, Bookmark, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TaskModal } from '@/features/board/types';
import TaskService from '@/services/taskApi';

interface Props {
  taskId: string;
  onClose: () => void;
}

function convertMinutesToWords(totalMinutes: number) {
  if (totalMinutes < 0) return "Invalid input";
  if (totalMinutes === 0) return "0 minutes";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hourText = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '';
  const minuteText = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '';

  return [hourText, minuteText].filter(Boolean).join(' and ');
}

export default function TaskModal({ taskId, onClose }: Props) {
  const [task, setTask] = useState<TaskModal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=> {
    const fetchTaskDetailById = async(taskId: string)=> {
      try {
        setIsLoading(true);
        const response = await TaskService.fetchTaskById(taskId); 

        if (response) {
          // construct response data 
          let data : TaskModal = {
            taskID: response.taskID, 
            taskUniqueCode: response.taskUniqueCode, 
            title: response.title, 
            description: response.description, 
            priority: response.priority, 
            type: response.type,
            status: response.status, 
            reporter: response.createdBy ? {
              userID: response.createdBy.userID,
              name: response.createdBy.name
            } : { userID: '', name: 'Unreported' }, 
            assignee: response.primaryAssigned ? {
              userID: response.primaryAssigned.userID,
              name: response.primaryAssigned.name
            } : null, 
            createdAt: response.createdAt, 
            updatedAt: response.updatedAt, 
            dueDate: response.dueDate, 
            estimatedMinutes: response.estimatedMinutes,
            actualTakenMinutes: response.actualTakenMinutes,
            comments: response.comments,
          }
          setTask(data);
        }
      } catch (error) {
        console.error("Error fetching task detail:", error)
      } finally {
        setIsLoading(false);
      }
    } 

    fetchTaskDetailById(taskId).then(()=> {
      if (taskId) {
        document.body.style.overflow = 'hidden';
      } else {
        setTask(null);
        document.body.style.overflow = 'unset';
      }
    }); 
    return () => {
      document.body.style.overflow = 'unset';
    };  
  }, [taskId])

  // Edits state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutsideStatus(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideStatus);
    return () => document.removeEventListener("mousedown", handleClickOutsideStatus);
  }, []);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("Add a description...");

  const [isCommenting, setIsCommenting] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setDescValue(task.description || "Add a description...");
    }
  }, [task]);

  if (isLoading || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 lg:p-12 animate-in fade-in duration-200">
        <div className="bg-white text-zinc-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <div className="h-4 w-40 bg-zinc-200 rounded"></div>
            <div className="h-8 w-8 bg-zinc-200 rounded-full"></div>
          </div>
          {/* Content Skeleton */}
          <div className="flex flex-1 overflow-hidden bg-white">
            <div className="flex-1 px-8 py-6 space-y-6">
              <div className="h-8 w-3/4 bg-zinc-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                <div className="h-20 w-full bg-zinc-100 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                <div className="h-24 w-full bg-zinc-100 rounded"></div>
              </div>
            </div>
            {/* Sidebar Skeleton */}
            <div className="w-[360px] border-l border-zinc-200 p-6 space-y-6 bg-zinc-50/50">
              <div className="h-8 w-32 bg-zinc-200 rounded"></div>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between"><div className="h-4 w-16 bg-zinc-200 rounded"></div><div className="h-4 w-24 bg-zinc-200 rounded"></div></div>
                <div className="flex justify-between"><div className="h-4 w-16 bg-zinc-200 rounded"></div><div className="h-4 w-24 bg-zinc-200 rounded"></div></div>
                <div className="flex justify-between"><div className="h-4 w-16 bg-zinc-200 rounded"></div><div className="h-4 w-24 bg-zinc-200 rounded"></div></div>
                <div className="flex justify-between"><div className="h-4 w-16 bg-zinc-200 rounded"></div><div className="h-4 w-24 bg-zinc-200 rounded"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 lg:p-12 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white text-zinc-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center text-sm text-zinc-500 font-medium tracking-wide">
            Add epic <span className="mx-2">/</span> <span className="text-blue-600">{task.taskUniqueCode}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-200" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          
          {/* Left Column (Main Content) */}
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            
            {/* Title */}
            {isEditingTitle ? (
               <input 
                 autoFocus
                 value={titleValue}
                 onChange={e => setTitleValue(e.target.value)}
                 onBlur={() => { setIsEditingTitle(false); setTask({...task, title: titleValue}) }}
                 className="text-[28px] font-semibold text-zinc-900 mb-6 leading-tight w-full outline-none border-2 border-primary rounded px-2 py-1"
               />
            ) : (
              <h1 
                className="text-[28px] font-semibold text-zinc-900 mb-6 leading-tight hover:bg-zinc-100 rounded px-2 py-1 -ml-2 cursor-text"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h1>
            )}

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-zinc-900 mb-3 tracking-wide">Description</h2>
              {isEditingDesc ? (
                <div>
                  <textarea 
                    autoFocus
                    value={descValue === "Add a description..." ? "" : descValue}
                    onChange={e => setDescValue(e.target.value)}
                    className="w-full min-h-[100px] border-2 border-primary rounded-md p-3 outline-none text-zinc-900 text-[15px] resize-y"
                    placeholder="Add a description..."
                  />
                  <div className="flex items-center gap-2 mt-2">
                     <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => setIsEditingDesc(false)}>Save</Button>
                     <Button size="sm" variant="ghost" className="text-zinc-600 font-semibold hover:bg-zinc-100" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-[15px] p-2 hover:bg-zinc-100 rounded-sm cursor-text text-zinc-700 transition-colors"
                  onClick={() => setIsEditingDesc(true)}
                >
                  {descValue}
                </div>
              )}
            </div>
            
            {/* Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-semibold text-zinc-900 tracking-wide">Activity</h2>
                 <div className="text-sm text-zinc-500">
                    Show: <span className="text-zinc-700 font-medium cursor-pointer p-1 bg-zinc-100 rounded hover:bg-zinc-200">Comments</span>
                 </div>
              </div>

              {/* Comment Input */}
              <div className="flex gap-4 mt-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <div className="flex-1">
                  {isCommenting ? (
                    <div>
                      <textarea
                        autoFocus
                        value={commentValue}
                        onChange={e => setCommentValue(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full min-h-[80px] border-2 border-primary outline-none text-zinc-900 text-[15px] p-3 rounded-md resize-y shadow-sm"
                      />
                      <div className="flex items-center gap-2 mt-2">
                         <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => { setIsCommenting(false); setCommentValue(""); }}>Save</Button>
                         <Button size="sm" variant="ghost" className="text-zinc-600 font-semibold hover:bg-zinc-100" onClick={() => { setIsCommenting(false); setCommentValue(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div 
                        className="border border-zinc-300 rounded-md bg-white hover:bg-zinc-50 p-3 min-h-[40px] cursor-text transition-colors shadow-sm"
                        onClick={() => setIsCommenting(true)}
                      >
                        <p className="text-zinc-500 text-[15px]">Add a comment...</p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 font-medium">Pro tip: press <span className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-600 border border-zinc-200 shadow-sm">M</span> to comment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Settings) */}
          <div className="w-[360px] border-l border-zinc-200 p-6 overflow-y-auto custom-scrollbar flex shrink-0 flex-col gap-6 bg-white">
            
            {/* Status Dropdown */}
            <div className="flex items-center gap-3 relative" ref={statusDropdownRef}>
               <button 
                 onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                 className={`flex items-center justify-between min-w-[140px] h-8 uppercase text-xs font-bold tracking-wider rounded px-3 outline-none cursor-pointer shadow-sm transition-colors ${
                   task.status === 'in-progress' 
                     ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700' 
                     : task.status === 'done'
                     ? 'bg-[#00875a] hover:bg-green-700 text-white border border-green-700'
                     : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300'
                 }`}
               >
                 <span>
                    {task.status === 'todo' ? 'TO DO' : task.status === 'in-progress' ? 'IN PROGRESS' : 'DONE'}
                 </span>
                 <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
               </button>

               <button
                 className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                 title="Delete task"
                 onClick={() => alert("Task deletion functionality will be wired up to the backend soon!")}
               >
                 <Trash2 className="w-4 h-4" />
               </button>

               {isStatusMenuOpen && (
                 <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-zinc-200 rounded-md shadow-lg z-50 p-1.5 flex flex-col gap-0.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button 
                       onClick={() => { setTask({...task, status: 'todo'}); setIsStatusMenuOpen(false); }}
                       className="w-full text-left px-2 py-2 transition-colors hover:bg-zinc-100 rounded flex items-center"
                    >
                       <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase transition-shadow">To Do</span>
                    </button>
                    <button 
                       onClick={() => { setTask({...task, status: 'in-progress'}); setIsStatusMenuOpen(false); }}
                       className="w-full text-left px-2 py-2 transition-colors hover:bg-zinc-100 rounded flex items-center"
                    >
                       <span className="inline-block bg-[#0052cc] text-white px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase transition-shadow">In Progress</span>
                    </button>
                    <button 
                       onClick={() => { setTask({...task, status: 'done'}); setIsStatusMenuOpen(false); }}
                       className="w-full text-left px-2 py-2 transition-colors hover:bg-zinc-100 rounded flex items-center"
                    >
                       <span className="inline-block bg-[#00875a] text-white px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase transition-shadow">Done</span>
                    </button>
                 </div>
               )}
            </div>

            {/* Details Accordion */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="flex items-center justify-between p-3 border-b border-zinc-200 bg-zinc-50">
                <h3 className="text-sm font-semibold text-zinc-900">Details</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center text-sm">
                  <span className="text-zinc-500 font-medium">Assignee</span>
                  <div className="flex items-center gap-2">
                    {task.assignee ? (
                      <div className="flex items-center group cursor-pointer hover:bg-zinc-100 p-1 -ml-1 rounded transition-colors pr-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 shadow-sm">
                          <span className="text-white text-[10px] font-bold">{task.assignee.name.charAt(0)}</span>
                        </div>
                        <span className="text-blue-600 font-medium hover:underline">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <button className="text-blue-600 font-medium hover:underline">Assign to me</button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Labels</span>
                  <span className="text-zinc-900">None</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Parent</span>
                  <span className="text-zinc-900">None</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Due date</span>
                  <span className="text-zinc-900">{new Date(task.dueDate as string).toLocaleDateString('en-GB')}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center text-sm">
                  <span className="text-zinc-500 font-medium">Priority</span>
                  <div className="flex items-center gap-2 text-zinc-900">
                    {getPriorityIcon()}
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center text-sm">
                  <span className="text-zinc-500 font-medium">Type</span>
                  <div className="flex items-center gap-2 text-zinc-900">
                    {getTypeIcon()}
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>

                 <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Estimated Time</span>
                  <span className="text-zinc-900">{convertMinutesToWords(task.estimatedMinutes)}</span>
                </div>

                 <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Actual Time</span>
                  <span className="text-zinc-900">{convertMinutesToWords(task.actualTakenMinutes)}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <span className="text-zinc-500 font-medium">Reporter</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-[9px] font-bold">{task.reporter.name.charAt(0)}</span>
                    </div>
                    <span className="text-zinc-900">{task.reporter.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-zinc-500 mt-auto pt-8 flex justify-between px-1">
              <span>Created {new Date(task.createdAt).toLocaleString() || 'Unknown'}</span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
