
import { ApiService } from '@/lib/axios';

// User related interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bookedShares?: UserBooking[];
}

export interface UserBooking {
  id: string;
  animalId: string;
  animalName: string;
  shares: number;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  bookedShares: [
    {
      id: 'booking1',
      animalId: '1',
      animalName: 'Premium Cow',
      shares: 2,
      bookingDate: '2023-05-15',
      status: 'confirmed'
    },
    {
      id: 'booking2',
      animalId: '3',
      animalName: 'Medium Cow',
      shares: 1,
      bookingDate: '2023-05-18',
      status: 'pending'
    }
  ]
};

// User API service
class UserService extends ApiService {
  private static instance: UserService;
  private isAuthenticated: boolean = false;
  private currentUser: User | null = null;

  private constructor() {
    super('https://localhost:7026/api/User');
  }

  // Singleton pattern
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.post<{ user: User; token: string }>('/login', credentials);
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      // Use mock data for demonstration
      this.isAuthenticated = true;
      this.currentUser = mockUser;
      localStorage.setItem('authToken', 'mock-token-12345');
      return mockUser;
    }
  }

  // Register user
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await this.post<{ user: User; token: string }>('/register', data);
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      // Use mock data for demonstration
      this.isAuthenticated = true;
      this.currentUser = { ...mockUser, name: data.name, email: data.email };
      localStorage.setItem('authToken', 'mock-token-12345');
      return this.currentUser;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Check authentication status
  checkAuth(): boolean {
    const token = localStorage.getItem('authToken');
    this.isAuthenticated = !!token;
    return this.isAuthenticated;
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!this.checkAuth()) {
      return null;
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    try {
            this.currentUser = mockUser;

      // const response = await this.get<User>('/me');
      // this.currentUser = response.data;
      // return this.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Use mock data
      this.currentUser = mockUser;
      return mockUser;
    }
  }

  // Get user bookings
  async getUserBookings(): Promise<UserBooking[]> {
    if (!this.checkAuth()) {
      return [];
    }

    try {
      const response = await this.get<UserBooking[]>('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      // Return mock bookings
      return mockUser.bookedShares || [];
    }
  }
}

export const userService = UserService.getInstance();
