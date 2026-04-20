import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Create the Axios instance
export const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Helper to flush the queue once refresh finishes
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. REQUEST INTERCEPTOR
// Automatically grab the accessToken from local storage before any request leaves
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR
// Catch 401s, handle refresh logic, and optionally queue blocked requests
apiClient.interceptors.response.use(
  (response) => {
    // Some custom systems wrap everything in 200s, but assuming standards here
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 Unauthorized, and we haven't retried this specific request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if the refresh token route itself is rejecting 401!
      if (originalRequest.url?.includes('refresh-token')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we are already refreshing, place this request in the paused queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token available, must re-login
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Fire refresh protocol
        const refreshResponse = await axios.post(`${backendUrl}/user/refresh-token`, {
          refreshToken,
        });

        // Depending on your backend response structure. Adjust as necessary!
        // Using response structure matching your login endpoint
        const newAccessToken = refreshResponse.data.data.auth.accessToken;
        const newRefreshToken = refreshResponse.data.data.auth.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

        // Resolve all queued queued requests
        processQueue(null, newAccessToken);
        
        // Re-execute initial failed request
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh token failed/expired
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Or use React Router history
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
