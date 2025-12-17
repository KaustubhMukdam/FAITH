import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://192.168.1.5:3000'; // Replace with your IP

class ApiService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refreshToken,
            });

            const { token: newToken } = response.data;
            const { user, refreshToken: newRefreshToken } = useAuthStore.getState();

            if (user) {
              await useAuthStore.getState().setAuth(user, newToken, newRefreshToken || refreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    return this.client.post('/api/auth/login', { email, password });
  }

  async register(name: string, email: string, password: string) {
    return this.client.post('/api/auth/register', { name, email, password });
  }

  // Transactions
  async getTransactions(params?: any) {
    return this.client.get('/api/transactions', { params });
  }

  async getTransactionSummary() {
    return this.client.get('/api/transactions/summary');
  }

  async createTransaction(data: any) {
    return this.client.post('/api/transactions', data);
  }

  async deleteTransaction(id: number) {
    return this.client.delete(`/api/transactions/${id}`);
  }

  // Budgets
  async getBudgets() {
    return this.client.get('/api/budgets');
  }

  async createBudget(data: any) {
    return this.client.post('/api/budgets', data);
  }

  // Accounts
  async getAccounts() {
    return this.client.get('/api/accounts');
  }

  async linkAccount(data: any) {
    return this.client.post('/api/accounts/link', data);
  }
}

export default new ApiService();
