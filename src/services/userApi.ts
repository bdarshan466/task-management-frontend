import { apiClient } from "@/lib/apiClient";

const fetchAllUsers = async()=> {
    try{
        const data = await apiClient.get('/user/listUsers');
        return data;
    } catch(error: any){
        console.error(error);
        return error.response?.data || {success: false, message: 'Failed to fetch users'};
    }
}

export default { fetchAllUsers };