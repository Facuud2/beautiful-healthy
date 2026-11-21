import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Usar proxy de Vite en desarrollo (evita duplicar /api)
  withCredentials: true, 
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized(); // ejecuta el handler centralizado
    }
    return Promise.reject(error);
  }
);

export default apiClient;