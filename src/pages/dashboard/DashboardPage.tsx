import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import KanbanBoard from '@/features/board/components/KanbanBoard';
import TaskModal from '@/features/board/components/TaskModal';
import { ChevronDown } from 'lucide-react';
import TeamService from '@/services/teamApi';
import UserService from '@/services/userApi';

export default function DashboardPage() {
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [teams, setTeams] = useState<{ teamID: string, name: string }[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ userID: string, name: string, color: string }[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIssue = searchParams.get('selectedIssue');
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  // const [teamsData, setTeamsData] = useState<{teamID: string, name: string}[]>([]);
  // const [usersData, setUsersData] = useState<{userID: string, name: string, email: string, role: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.message) {
      setToastMessage(location.state.message);
      
      // Clear the message from state after 5 seconds
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeamMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colors = [
    'bg-red-500 text-white',
    'bg-blue-500 text-white',
    'bg-purple-600 text-white',
    'bg-green-500 text-white',
    'bg-yellow-500 text-white',
    'bg-pink-500 text-white',
    'bg-orange-500 text-white',
    'bg-purple-500 text-white',
    'bg-red-500 text-white',
    'bg-blue-500 text-white'
  ]

  useEffect(() => {
    const fetchTeamList = async () => {
      try {
        const response = await TeamService.fetchTeamListApi();
        if (response.success) {
          const teamArray = response.data.map((t: any) => {
            return {
              teamID: t.teamID,
              name: t.name
            }
          });
          setTeams(teamArray);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeamList();
  }, []);

  useEffect(() => {

    // fetch all users 
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true);
        const response = await UserService.fetchAllUsers();
        if (response.success) {
          const users = response.data.map((u: { userID: string, name: string, email: string, role: string }) => {
            return {
              userID: u.userID,
              name: u.name,
              color: colors[Math.floor(Math.random() * colors.length)]
            }
          });
          setTeamMembers(users);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };
    fetchAllUsers();
  }, [])

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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-32">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-500 font-medium">Loading dashboard details...</p>
          </div>
        ) : (
          <>
             {/* Header Section */}
        <div className="px-8 pt-6 pb-4">
          <div className="text-sm text-zinc-500 font-medium mb-3 flex items-center gap-2">
            <div className="relative inline-block w-[240px]" ref={dropdownRef}>
              <button
                onClick={() => setIsTeamMenuOpen(!isTeamMenuOpen)}
                className="flex items-center justify-between w-full bg-white hover:bg-zinc-50 text-[14px] text-zinc-800 font-semibold border border-zinc-200 h-10 rounded-md px-3 outline-none cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <span>{selectedTeam ? teams.find(t => t.teamID === selectedTeam)?.name + ' Team' : 'All Teams (Global Board)'}</span>
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
                      key={team.teamID}
                      onClick={() => { setSelectedTeam(team.teamID); setIsTeamMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${selectedTeam === team.teamID ? 'bg-blue-50 text-blue-700' : 'text-zinc-800 hover:bg-zinc-100'}`}
                    >
                      {team.name} Team
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!selectedTeam && (
              <span className="text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md px-3 py-1.5 text-xs font-semibold ml-2 flex items-center gap-1.5 shadow-sm animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                First select the team
              </span>
            )}
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
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-transform hover:-translate-y-1 hover:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${member.color
                    } ${selectedAssignee && selectedAssignee !== member.name ? 'opacity-40 grayscale-[50%]' : 'z-0'
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

              {/* Border Section */}
              <div className="flex-1 overflow-hidden px-8 pb-8 pt-2">
                <KanbanBoard
                  selectedAssignee={selectedAssignee}
                  selectedStatusFilter={selectedStatusFilter}
                  selectedTeam={selectedTeam}
                />
              </div>

            {/* Custom Toast Notification */}
            {toastMessage && (
              <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-top-10 duration-300 max-w-sm w-full ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                <div className={`p-1.5 rounded-full ${toastMessage.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
                  {toastMessage.type === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{toastMessage.text}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => setToastMessage(null)}
                  className={`p-1 rounded-full transition-colors ${toastMessage.type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedIssue && (
        <TaskModal taskId={selectedIssue} onClose={closeTaskModal} />
      )}
    </DashboardLayout>
  );
}
