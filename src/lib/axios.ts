
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Default base URL - you should replace this with your actual API endpoint
const BASE_URL = 'https://localhost:7026';

// Create a generic API service class
export class ApiService<T = any> {
  private api: AxiosInstance;
  private mockData: T[] | null;

  constructor(baseURL: string = BASE_URL, mockData: T[] | null = null) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.mockData = mockData;

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage if you have authentication
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['X-Tenant-ID'] = `tenant1`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log the error
        console.error('API Error:', error);
        
        // If we have mock data and the request failed, return it
        if (this.mockData) {
          console.log('Using mock data as fallback');
          return Promise.resolve({
            data: this.mockData,
            status: 200,
            statusText: 'OK (Mock Data)',
            headers: {},
            config: error.config,
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic GET method
  async get<R = T>(url: string, searchQuery?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    try {
      if (searchQuery) {
        config = config || {};
        config.headers = {
          ...(config.headers || {}),
          'X-Search-Query': JSON.stringify(searchQuery),
        };
      }
      return await this.api.get<R>(url, config);
    } catch (error) {
      if (this.mockData) {
        return {
          data: this.mockData as any,
          status: 200,
          statusText: 'OK (Mock Data)',
          headers: {},
          config: config || {},
        } as AxiosResponse<R>;
      }
      throw error;
    }
  }

  // Generic POST method
  async post<R = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    try {
      return await this.api.post<R>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT method
  async put<R = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    try {
      return await this.api.put<R>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE method
  async delete<R = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    try {
      return await this.api.delete<R>(url, config);
    } catch (error) {
      throw error;
    }
  }
}
