import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.5:5000/api'; // Android emulator
// const API_URL = 'http://localhost:5000/api'; // iOS simulator
// const API_URL = 'https://your-api.com/api'; // Production

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data.data.tokens;
              await SecureStore.setItemAsync('accessToken', accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Transactions
  async getTransactions(filters?: any) {
    const response = await this.api.get('/transactions', { params: filters });
    return response.data;
  }

  async createTransaction(data: any) {
    const response = await this.api.post('/transactions', data);
    return response.data;
  }

  async getTransactionSummary(startDate?: string, endDate?: string) {
    const response = await this.api.get('/transactions/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Budgets
  async getBudgets() {
    const response = await this.api.get('/budgets');
    return response.data;
  }

  async getBudgetByMonth(month: string) {
    const response = await this.api.get(`/budgets/${month}`);
    return response.data;
  }

  async getBudgetSpending(month: string) {
    const response = await this.api.get(`/budgets/${month}/spending`);
    return response.data;
  }

  async createBudget(data: any) {
    const response = await this.api.post('/budgets', data);
    return response.data;
  }

  // Accounts
  async getLinkedAccounts() {
    const response = await this.api.get('/accounts');
    return response.data;
  }

  async linkAccount(data: any) {
    const response = await this.api.post('/accounts', data);
    return response.data;
  }
}

export default new ApiService();
