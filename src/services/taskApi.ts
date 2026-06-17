import { apiClient } from "@/lib/apiClient";

const fetchTaskListApi = async (teamID: string, userIDs?: string[], statuses?: string[]) => {
    try {
        const url = new URLSearchParams();
        if (teamID) {
            url.append('teamID', teamID);
        }
        if (userIDs?.length) url.append("userIDs", userIDs.join(","));
        if (statuses?.length) url.append("statuses", statuses.join(","));

        const response = await apiClient.get(`/task/list?${url}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

const fetchTaskById = async (taskId: string) => {
    try {
        const response = await apiClient.get(`/task/${taskId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching task by ID:', error);
    }
};



export default { fetchTaskListApi, fetchTaskById };