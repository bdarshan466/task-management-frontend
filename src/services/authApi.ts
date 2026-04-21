import { apiClient } from '@/lib/apiClient';

const loginApi = async (email: string, password: string) => {
  try {
    const data = await apiClient.post('/user/login', { email, password });
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Login failed' };
  }
};

const signUpApi = async (name: string, email: string, role: string, password: string) => {
  try {
    const data = await apiClient.post('/user/register', { name, email, role, password });
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Signup failed' };
  }
};

const forgotPasswordApi = async (email: string, newPassword: string) => {
  try {
    const data = await apiClient.post('/user/forgot-password', { email, newPassword });
    return data;
  } catch (error: any) {
    console.error(error);
    return error.response?.data || { success: false, message: 'Password reset failed' };
  }
};

export default { loginApi, signUpApi, forgotPasswordApi };
