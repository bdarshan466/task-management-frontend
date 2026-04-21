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

const addMemberApi = async (teamID: string, userID: string, role: string) => {
  try {
    const data = await apiClient.post(`/team/assign`, {teamID, userID, role});
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Add Member Failed' };
  }
};

export default { addTeamApi, updateTeamApi, addMemberApi };
