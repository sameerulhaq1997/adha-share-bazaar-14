
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
const mockUsers: User[] = [
  {
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
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987-654-3210',
    bookedShares: [
      {
        id: 'booking3',
        animalId: '1',
        animalName: 'Premium Cow',
        shares: 1,
        bookingDate: '2023-05-16',
        status: 'confirmed'
      }
    ]
  },
  {
    id: '3',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    bookedShares: [
      {
        id: 'booking4',
        animalId: '2',
        animalName: 'Large Goat',
        shares: 1,
        bookingDate: '2023-05-20',
        status: 'confirmed'
      }
    ]
  }
];

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
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('isAdmin', user.email.includes('admin') ? 'true' : 'false');
      
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      // Use mock data for demonstration
      const mockUser = mockUsers.find(user => user.email === credentials.email) || mockUsers[0];
      this.isAuthenticated = true;
      this.currentUser = mockUser;
      localStorage.setItem('authToken', 'mock-token-12345');
      localStorage.setItem('userName', mockUser.name);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('userId', mockUser.id);
      localStorage.setItem('isAdmin', mockUser.email.includes('admin') ? 'true' : 'false');
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
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('isAdmin', user.email.includes('admin') ? 'true' : 'false');
      
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      // Use mock data for demonstration
      const newUser: User = { 
        id: (mockUsers.length + 1).toString(),
        name: data.name, 
        email: data.email,
        phone: data.phone,
        bookedShares: []
      };
      mockUsers.push(newUser);
      
      this.isAuthenticated = true;
      this.currentUser = newUser;
      localStorage.setItem('authToken', 'mock-token-12345');
      localStorage.setItem('userName', newUser.name);
      localStorage.setItem('userEmail', newUser.email);
      localStorage.setItem('userId', newUser.id);
      localStorage.setItem('isAdmin', newUser.email.includes('admin') ? 'true' : 'false');
      return newUser;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Check authentication status
  checkAuth(): boolean {
    const token = localStorage.getItem('authToken');
    this.isAuthenticated = !!token;
    return this.isAuthenticated;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin === 'true';
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
      // Create user from localStorage
      const id = localStorage.getItem('userId') || '1';
      const name = localStorage.getItem('userName') || 'John Doe';
      const email = localStorage.getItem('userEmail') || 'john@example.com';
      const user = mockUsers.find(user => user.id === id) || {
        id,
        name,
        email,
        bookedShares: []
      };
      this.currentUser = user;
      return user;
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
      const userId = localStorage.getItem('userId') || '1';
      const user = mockUsers.find(user => user.id === userId);
      return user?.bookedShares || [];
    }
  }
  
  // Get users who booked an animal
  async getUsersByAnimalId(animalId: string): Promise<User[]> {
    try {
      const response = await this.get<User[]>(`/bookings/animal/${animalId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for animal ${animalId}:`, error);
      // Filter mock users who have booked the animal
      return mockUsers.filter(user => 
        user.bookedShares?.some(booking => booking.animalId === animalId)
      );
    }
  }
}

export const userService = UserService.getInstance();
export { mockUsers };
