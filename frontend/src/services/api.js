import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isAuthRequest = (url = '') => {
  return url.includes('/auth/login') || url.includes('/auth/login-pin') || url.includes('/auth/biometric');
};

// Interceptor para autenticação
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/login-pin') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh');

    // Retry curto para reduzir erro de rede quando o backend está voltando de cold start.
    const shouldRetryNetworkError = !error.response && originalRequest && !originalRequest._networkRetry && isAuthRequest(requestUrl);
    if (shouldRetryNetworkError) {
      originalRequest._networkRetry = true;
      await wait(2500);
      return apiClient(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const newAccessToken = response?.data?.data?.accessToken || response?.data?.accessToken;
        const newRefreshToken = response?.data?.data?.refreshToken || response?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh sem access token');
        }

        await AsyncStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        throw err;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
