import { apiClient } from '@/lib/apiClient';

const addTeamApi = async (name: string) => {
  try {
    const response = await apiClient.post('/team/register', { name });
    return response;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Add Team Failed' };
  }
};

const updateTeamApi = async (teamID: string, name: string) => {
  try {
    const data = await apiClient.patch(`/team/${teamID}`, { name });
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Update Team Failed' };
  }
};

const deleteTeamApi = async (teamID: string) => {
  try {
    const data = await apiClient.delete(`/team/${teamID}`);
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Delete Team Failed' };
  }
};

const addMemberApi = async (teamID: string, userID: string, role: string) => {
  try {
    const data = await apiClient.post(`/team/assign`, {teamID, userID, role});
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Add Member Failed' };
  }
};

const getListTeamsApi = async () => {
  try {
    const data = await apiClient.get(`/team/list`);
    console.log("List of teams in teamApi: ", data);
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Get List Teams Failed' };
  }
};

export default { addTeamApi, updateTeamApi, addMemberApi, deleteTeamApi, getListTeamsApi };
