import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Pencil, Trash2, UserPlus, Plus } from 'lucide-react';
import type { Team } from '@/features/teams/types';
import EditTeamModal from '@/features/teams/components/EditTeamModal';
import AddTeamModal from '@/features/teams/components/AddTeamModal';
import AddMemberModal from '@/features/teams/components/AddMemberModal';
import { apiClient } from '@/lib/apiClient';
import TeamService from '@/services/teamApi';

export default function TeamsPage() {
  const [teamsData, setTeamsData] = useState<Team[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalPages = Math.max(1, Math.ceil(teamsData.length / itemsPerPage));
  
  // Calculate index offset
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeams = teamsData.slice(startIndex, startIndex + itemsPerPage);

  // 1. Add pagination variables into the callback dependencies
  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      // Pass the state variables to the backend query
      const response : any = await apiClient.get(`/team/all?page=${currentPage}&limit=${itemsPerPage}`);

      if (response.success === false) {
        setToastMessage({ text: response.message || "Failed to fetch teams", type: 'error' });
        setTimeout(() => setToastMessage(null), 3000);
        setTeamsData([]);
        return;
      }
      
      const formattedTeams = response.data?.results.map((team: any) => ({
        teamID: team.teamID,
        name: team.name,
        members: team.totalMembers || 0,
        owner: team.createdBy?.name || localStorage.getItem("loggedInUserName"),
        ownerUserID: team.createdBy?.userID
      }));
      setTeamsData(formattedTeams);
      setToastMessage({ text: response.message || "Teams fetched successfully", type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]); // <-- Recreate function ONLY when page/limit changes

useEffect(()=> {
  fetchTeams();
}, [fetchTeams])

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleDelete = async (teamID: string) => {
    try {
      const response = await TeamService.deleteTeamApi(teamID);

      if(response.success === false){
        setToastMessage({ text: response.message || "Failed to delete team", type: 'error' });
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setTeamsData(prev => prev.filter(t => t.teamID !== teamID));
      setToastMessage({ text: response.message || "Team deleted successfully", type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTeam = async (teamID: string, newName: string) => {
    try {
      const response: any = await TeamService.updateTeamApi(teamID, newName);
      
      // Since updateTeamApi catches internally and returns an object `{ success: false }` on failure
      if (response && response.success === false) {
        setToastMessage({ text: response.message || "Failed to update team", type: 'error' });
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setTeamsData(prev => prev.map(t => t.teamID === teamID ? { ...t, name: newName } : t));
      setEditingTeam(null);
      
      // Success response will typically be an AxiosResponse containing .data.message
      const successMessage = response?.data?.message || "Team updated successfully";
      setToastMessage({ text: successMessage, type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      setToastMessage({ text: "Failed to update team", type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddTeam = async (name: string) => {
      try {
        const response = await TeamService.addTeamApi(name);

        if(response.success === false){
          setToastMessage({ text: response.message || "Failed to add team", type: 'error' });
          setTimeout(() => setToastMessage(null), 3000);
          return;
        }

        const newTeam = {
          teamID: response.data.teamID, 
          name: response.data.name, 
          members: response.data.members || 1,
          owner: localStorage.getItem("loggedInUserName"),
          ownerUserID: localStorage.getItem("loggedInUserID")
        }
        setTeamsData([newTeam, ...teamsData]);
        setIsAddTeamOpen(false);
        setToastMessage({ text: response.message || "Team added successfully", type: 'success' });
        setTimeout(() => setToastMessage(null), 3000);
      } catch (error) {
        console.error(error);
      }
  };

  const handleAddMember = async (teamID: string, userID: string, role: string) => {
    // Simulated add member behavior
    const response = await TeamService.addMemberApi(teamID, userID, role); 

    if(response.success === false){
      setToastMessage({ text: response.message || "Failed to add member", type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    } 

    setTeamsData(prev => prev.map(t => t.teamID === teamID ? { ...t, members: Number(t.members) + 1 } : t));
    setIsAddMemberOpen(false);
    setToastMessage({ text: response.message || "Member added successfully", type: 'success' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-8 text-zinc-900 border-x border-zinc-200 relative">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm text-zinc-500 font-medium mb-1">Company / Teams</div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Teams</h1>
            <p className="text-zinc-500 mt-1">Manage and view all registered teams across the workspace.</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
            onClick={() => setIsAddTeamOpen(true)}
          >
            <Plus className="w-5 h-5" /> Add Team
          </Button>
        </div>

        {/* Table Container */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-32">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-500 font-medium">Loading teams details...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">No.</th>
                  <th className="px-8 py-4">Team Name</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {currentTeams.map((team, index) => {
                  const displayIndex = startIndex + index + 1;
                  
                  return (
                    <tr key={team.teamID} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-400">
                        {displayIndex}
                      </td>
                      <td className="px-8 py-4 font-medium text-blue-600 hover:underline cursor-pointer">
                        {team.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-700">
                        {team.members} members
                      </td>
                      <td className="px-6 py-4 text-zinc-700">
                        {team.owner}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <button 
                          onClick={() => setEditingTeam(team)}
                          className="text-zinc-500 hover:text-blue-600 transition-colors bg-white hover:bg-zinc-100 p-1.5 rounded-md shadow-sm border border-zinc-200"
                          title="Edit Team"
                          disabled={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                          hidden={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedTeamID(team.teamID); setIsAddMemberOpen(true); }}
                          className="text-zinc-500 hover:text-green-600 transition-colors bg-white hover:bg-zinc-100 p-1.5 rounded-md shadow-sm border border-zinc-200"
                          title="Add Member"
                          disabled={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                          hidden={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(team.teamID)}
                          className="flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 transition-colors bg-red-50 px-2 py-1.5 rounded-md text-xs font-semibold"
                          disabled={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                          hidden={team.ownerUserID !== localStorage.getItem("loggedInUserID")}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {teamsData.length === 0 && (
              <div className="py-12 text-center text-zinc-400">
                No teams remaining.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {teamsData.length > 0 && (
            <div className="mt-auto px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-sm text-zinc-600 font-medium">
                  Showing <span className="font-bold text-zinc-900">{startIndex + 1}</span> to <span className="font-bold text-zinc-900">{Math.min(startIndex + itemsPerPage, teamsData.length)}</span> of <span className="font-bold text-zinc-900">{teamsData.length}</span> teams
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 font-medium tracking-wide">Rows per page:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="text-sm bg-white border border-zinc-200 rounded px-2 h-7 font-medium outline-none cursor-pointer hover:bg-zinc-50 text-zinc-700 shadow-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-center px-2 text-sm font-semibold text-zinc-900">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <EditTeamModal 
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSave={handleUpdateTeam}
      />
      
      <AddTeamModal 
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        onAdd={handleAddTeam}
      />

      <AddMemberModal 
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        teamID={selectedTeamID}
        onAdd={handleAddMember}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 font-medium ${
          toastMessage.type === 'success' 
            ? 'bg-white text-green-600 border border-zinc-200' 
            : 'bg-white text-red-600 border border-zinc-200'
        }`}>
          {toastMessage.text}
        </div>
      )}
    </DashboardLayout>
  );
}
