
import { ApiService } from '@/lib/axios';

// User related interfaces
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bookedShares?: UserBooking[];
  token?: string;
  role?: string;
  status?: string;
  bookingDate?: string;
  shares?: string;
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
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'John Doe',
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
    fullName: 'Jane Smith',
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
    fullName: 'Ahmed Khan',
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
  setUserDataLocally(user: User): void{
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('userName', user.fullName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userPhone', user.phone);
      localStorage.setItem('isAdmin', (user.role ?? "") == "Admin" ? 'true' : 'false');
  }

 getUserDataLocally(): User {
  const user: User = {
    token: localStorage.getItem('authToken') || '',
    fullName: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    id: localStorage.getItem('userId') || '',
    phone: localStorage.getItem('userPhone') || ''
  };

  return user;
}


  // Login user
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      ;
      const response = await this.post<{  value: User; }>('/login', credentials);
      let user = response.data.value;
      this.setUserDataLocally(user);
      
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
    }
  }

  // Register user
  async register(data: RegisterData): Promise<User> {
    try {
      ;
      const response = await this.post<{  value: User; }>('/register', data);
      let user = response.data.value;
      this.setUserDataLocally(user);

      
      this.isAuthenticated = true;
      this.currentUser = user;
      
      return user;
    } catch (error) {
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
    ;
    if (!this.checkAuth()) {
      return null;
    }
    else{
      return this.getUserDataLocally()
    }
  }

  
  // Get users who booked an animal
  async getUsersByAnimalId(animalId: string): Promise<User[]> {
    try {
      const response = await this.get<{value: User[];}>(`/user-bookings?animalId=${animalId}`);
      return response.data.value;
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
