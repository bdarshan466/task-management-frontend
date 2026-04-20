import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import KanbanBoard from '@/features/board/components/KanbanBoard';
import TaskModal from '@/features/board/components/TaskModal';
import { ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIssue = searchParams.get('selectedIssue');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeamMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const teamMembers = [
    { name: 'Alice', color: 'bg-red-500 text-white' },
    { name: 'Bob', color: 'bg-blue-500 text-white' },
    { name: 'Darshan', color: 'bg-purple-600 text-white' },
  ];

  const teams = [
    { id: 'team-1', name: 'Engineering' },
    { id: 'team-2', name: 'Product' },
    { id: 'team-3', name: 'Marketing' },
  ];

  const handleAvatarClick = (name: string) => {
    // Toggle filter off if clicking the already selected user
    if (selectedAssignee === name) {
      setSelectedAssignee(null);
    } else {
      setSelectedAssignee(name);
    }
  };

  const closeTaskModal = () => {
    searchParams.delete('selectedIssue');
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="px-8 pt-6 pb-4">
          <div className="text-sm text-zinc-500 font-medium mb-3 flex items-center gap-2">
            <div className="relative inline-block w-[240px]" ref={dropdownRef}>
              <button
                onClick={() => setIsTeamMenuOpen(!isTeamMenuOpen)}
                className="flex items-center justify-between w-full bg-white hover:bg-zinc-50 text-[14px] text-zinc-800 font-semibold border border-zinc-200 h-10 rounded-md px-3 outline-none cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <span>{selectedTeam ? teams.find(t => t.id === selectedTeam)?.name + ' Team' : 'All Teams (Global Board)'}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500 ml-2" />
              </button>
              
              {isTeamMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg z-50 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => { setSelectedTeam(null); setIsTeamMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${!selectedTeam ? 'bg-blue-50 text-blue-700' : 'text-zinc-800 hover:bg-zinc-100'}`}
                  >
                    All Teams (Global Board)
                  </button>
                  {teams.map(team => (
                    <button 
                      key={team.id}
                      onClick={() => { setSelectedTeam(team.id); setIsTeamMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${selectedTeam === team.id ? 'bg-blue-50 text-blue-700' : 'text-zinc-800 hover:bg-zinc-100'}`}
                    >
                      {team.name} Team
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">Kanban board</h1>
          
          {/* Filtering row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              {teamMembers.map((member) => (
                <button
                  key={member.name}
                  onClick={() => handleAvatarClick(member.name)}
                  title={`Filter by ${member.name}`}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-transform hover:-translate-y-1 hover:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    member.color
                  } ${
                    selectedAssignee && selectedAssignee !== member.name ? 'opacity-40 grayscale-[50%]' : 'z-0'
                  } ${selectedAssignee === member.name ? 'ring-2 ring-primary ring-offset-2 z-10' : ''}`}
                >
                  <span className="text-xs font-bold">{member.name.charAt(0)}</span>
                </button>
              ))}
            </div>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            {/* Status Dropdown Filter */}
            <select
              className="bg-zinc-100 hover:bg-zinc-200 text-sm text-zinc-700 font-medium border border-zinc-200 h-8 rounded px-3 outline-none cursor-pointer appearance-none relative shadow-sm"
              value={selectedStatusFilter || ''}
              onChange={(e) => setSelectedStatusFilter(e.target.value || null)}
              style={{ 
                backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="rgb(82 82 91)" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, 
                backgroundRepeat: 'no-repeat', 
                backgroundPositionX: 'calc(100% - 4px)', 
                backgroundPositionY: '50%',
                paddingRight: '28px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {(selectedAssignee || selectedStatusFilter || selectedTeam) && (
              <button 
                onClick={() => { setSelectedAssignee(null); setSelectedStatusFilter(null); setSelectedTeam(null); }}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Board Section */}
        <div className="flex-1 overflow-hidden px-8 pb-8 pt-2">
          <KanbanBoard 
            selectedAssignee={selectedAssignee} 
            selectedStatusFilter={selectedStatusFilter} 
            selectedTeam={selectedTeam}
          />
        </div>
      </div>
      
      {/* Modal Overlay */}
      {selectedIssue && (
        <TaskModal taskId={selectedIssue} onClose={closeTaskModal} />
      )}
    </DashboardLayout>
  );
}
