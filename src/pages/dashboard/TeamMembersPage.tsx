import { useCallback, useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Users, Shield, User, UserMinus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import TeamService from '@/services/teamApi';

interface Team {
  id: string;
  name: string;
}

interface Member {
  userID: string;
  name: string;
  email: string;
  systemRole: string;
  teamRole: string | null;
}

export default function TeamMembersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentUserTeamRole, setCurrentUserTeamRole] = useState<string | null>(null);
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Remove teammate modal states
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const loggedInUserID = localStorage.getItem("loggedInUserID");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeamMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all teams for the dropdown
  const fetchTeams = useCallback(async () => {
    try {
      const response: any = await TeamService.fetchTeamListApi();
      console.log("team list response", response);
      if (response && response.success !== false) {
        const formattedTeams = response.data?.map((team: any) => ({
          id: team.teamID,
          name: team.name,
        })) || [];
        setTeams(formattedTeams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  }, []);

  // Fetch members (either all users or team-specific members)
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedTeam) {
        const response: any = await apiClient.get(`/team/member/${selectedTeam}`);
        if (response && response.success !== false) {
          const teamMembers = response.data?.teamMembers?.map((m: any) => ({
            userID: m.user?.userID || m.userID,
            name: m.user?.name || 'Unknown',
            email: m.user?.email || 'N/A',
            systemRole: m.user?.role || 'user',
            teamRole: m.role || 'member',
          })) || [];
          setMembers(teamMembers);

          // Find current logged-in user's role in the selected team
          const currentUserMember = response.data?.teamMembers?.find(
            (m: any) => (m.user?.userID || m.userID) === loggedInUserID
          );
          if (currentUserMember) {
            setCurrentUserTeamRole(currentUserMember.role || 'member');
          } else {
            setCurrentUserTeamRole(null);
          }
        } else {
          setMembers([]);
          setCurrentUserTeamRole(null);
        }
      } else {
        const response: any = await apiClient.get('/user/listUsers');
        if (response && response.success !== false) {
          const userList = response.data?.map((u: any) => ({
            userID: u.userID,
            name: u.name,
            email: u.email,
            systemRole: u.role,
            teamRole: null,
          })) || [];
          setMembers(userList);
        } else {
          setMembers([]);
        }
        setCurrentUserTeamRole(null);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setToastMessage({ text: 'Failed to fetch team members', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
      setMembers([]);
      setCurrentUserTeamRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeam, loggedInUserID]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    fetchMembers();
    setCurrentPage(1); // Reset page on filter change
  }, [fetchMembers]);

  // Handle local searching
  const filteredMembers = members.filter((member) => {
    const nameMatch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Confirm teammate removal
  const handleRemoveConfirm = async () => {
    if (!selectedTeam || !memberToRemove) return;
    setIsRemoving(true);
    try {
      const response: any = await TeamService.removeMemberApi(selectedTeam, memberToRemove.userID);
      if (response && response.success !== false) {
        setToastMessage({ text: response.message || 'Teammate removed successfully', type: 'success' });
        setTimeout(() => setToastMessage(null), 3000);
        // Refresh members
        fetchMembers();
      } else {
        setToastMessage({ text: response.message || 'Failed to remove teammate', type: 'error' });
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to remove teammate:', error);
      setToastMessage({ text: 'Failed to remove teammate', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  // Dynamically assign avatar styling color
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500 text-white',
      'bg-blue-500 text-white',
      'bg-purple-600 text-white',
      'bg-green-600 text-white',
      'bg-yellow-600 text-white',
      'bg-pink-600 text-white',
      'bg-indigo-600 text-white',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-8 text-zinc-900 border-x border-zinc-200 relative animate-fade-in duration-300">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-sm text-zinc-500 font-medium mb-1">Company / Team Members</div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Team Members</h1>
            <p className="text-zinc-500 mt-1">View and filter team members across the registered teams.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Team Dropdown Filter */}
            <div className="relative inline-block w-[240px]" ref={dropdownRef}>
              <button
                onClick={() => setIsTeamMenuOpen(!isTeamMenuOpen)}
                className="flex items-center justify-between w-full bg-white hover:bg-zinc-50 text-[14px] text-zinc-800 font-semibold border border-zinc-200 h-10 rounded-md px-3 outline-none cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <span className="truncate">
                  {selectedTeam
                    ? teams.find((t) => t.id === selectedTeam)?.name + ' Team'
                    : 'All Teams (Global List)'}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500 ml-2 flex-shrink-0" />
              </button>

              {isTeamMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg z-50 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setSelectedTeam(null);
                      setIsTeamMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${!selectedTeam ? 'bg-blue-50 text-blue-700' : 'text-zinc-800 hover:bg-zinc-100'
                      }`}
                  >
                    All Teams (Global List)
                  </button>
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team.id);
                        setIsTeamMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${selectedTeam === team.id ? 'bg-blue-50 text-blue-700' : 'text-zinc-800 hover:bg-zinc-100'
                        }`}
                    >
                      {team.name} Team
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Local Search Input */}
            <div className="relative w-[200px] md:w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 w-full text-sm rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-32">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-500 font-medium">Loading team members...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 w-16">No.</th>
                      <th className="px-8 py-4">Teammate</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">System Role</th>
                      <th className="px-6 py-4">Team Role</th>
                      <th className="px-6 py-4 w-28 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {currentMembers.map((member, index) => {
                      const displayIndex = startIndex + index + 1;
                      const avatarBg = getAvatarColor(member.name);

                      // Security Check Logic
                      // 1. Identify the logged-in user's role in this selected team
                      const isRequesterOwner = currentUserTeamRole === 'owner';
                      const isRequesterAdmin = currentUserTeamRole === 'admin';

                      // 2. Identify the target teammate's role and identity
                      const isTargetOwner = member.teamRole === 'owner';
                      const isTargetSelf = member.userID === loggedInUserID;

                      // 3. Define the rules for when to disable the "Remove" button:
                      const isGlobalView = !selectedTeam; // Cannot remove from "All Teams" view
                      const isSelfRemoval = isTargetSelf; // Cannot remove yourself from this list
                      const isUnauthorized = !isRequesterOwner && !isRequesterAdmin; // Only admin or owner can remove members
                      const isAdminRemovingOwner = isRequesterAdmin && isTargetOwner; // Admins cannot remove the team owner

                      // Combined rule check
                      const isActionDisabled = isGlobalView || isSelfRemoval || isUnauthorized || isAdminRemovingOwner;

                      let disabledTooltip = "Remove teammate from team";
                      if (isGlobalView) {
                        disabledTooltip = "Select a specific team to manage teammates";
                      } else if (isSelfRemoval) {
                        disabledTooltip = "You cannot remove yourself";
                      } else if (isUnauthorized) {
                        disabledTooltip = "Members cannot remove teammates (Owner/Admin required)";
                      } else if (isAdminRemovingOwner) {
                        disabledTooltip = "Admins cannot remove the team Owner";
                      }

                      return (
                        <tr key={member.userID} className="hover:bg-zinc-50/75 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-400">
                            {displayIndex}
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarBg}`}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-zinc-900">{member.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">
                            {member.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.systemRole === 'admin'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                              <Shield className="w-3.5 h-3.5" />
                              {member.systemRole}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {member.teamRole ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.teamRole === 'owner' || member.teamRole === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                <User className="w-3.5 h-3.5" />
                                {member.teamRole}
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-xs italic">N/A (Global View)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setMemberToRemove(member)}
                              disabled={isActionDisabled}
                              className={`p-1.5 rounded-md border transition-all ${isActionDisabled
                                ? 'text-zinc-300 bg-zinc-50 border-zinc-100 cursor-not-allowed'
                                : 'text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 bg-white border-zinc-200 shadow-sm cursor-pointer'
                                }`}
                              title={disabledTooltip}
                            >
                              <UserMinus className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredMembers.length === 0 && (
                  <div className="py-24 text-center">
                    <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No team members found matching the criteria.</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {filteredMembers.length > 0 && (
                <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <span className="text-sm text-zinc-600 font-medium">
                      Showing <span className="font-bold text-zinc-900">{startIndex + 1}</span> to{' '}
                      <span className="font-bold text-zinc-900">
                        {Math.min(startIndex + itemsPerPage, filteredMembers.length)}
                      </span>{' '}
                      of <span className="font-bold text-zinc-900">{filteredMembers.length}</span> members
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500 font-medium tracking-wide">Rows per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
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

        {/* Custom Confirmation Modal */}
        {memberToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white text-zinc-900 w-full max-w-md rounded-xl shadow-2xl p-6 border border-zinc-200 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-zinc-950 mb-2">Remove Teammate</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-zinc-800">{memberToRemove.name}</span> from the <span className="font-semibold text-zinc-800">{teams.find((t) => t.id === selectedTeam)?.name || ''}</span> team? This teammate will lose access to team boards and resources.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemoving}
                  className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemoveConfirm}
                  disabled={isRemoving}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
                >
                  {isRemoving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Removing...
                    </>
                  ) : (
                    'Yes, Remove'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 font-medium ${toastMessage.type === 'success'
              ? 'bg-white text-green-600 border border-zinc-200'
              : 'bg-white text-red-600 border border-zinc-200'
              }`}
          >
            {toastMessage.text}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
