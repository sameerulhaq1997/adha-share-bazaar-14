
import { ApiService } from '@/lib/axios';

// Booking interface
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  animalId: string;
  animalName: string;
  shares: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  bookingDate: string;
  notes?: string;
}

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: "booking1",
    userId: "user1",
    userName: "Ahmed Khan",
    userEmail: "ahmed@example.com",
    animalId: "1",
    animalName: "Premium Cow",
    shares: 2,
    totalAmount: 12000,
    status: "confirmed",
    bookingDate: "2025-05-15T10:30:00Z",
  },
  {
    id: "booking2",
    userId: "user2",
    userName: "Fatima Ali",
    userEmail: "fatima@example.com",
    animalId: "3",
    animalName: "Medium Cow",
    shares: 1,
    totalAmount: 5000,
    status: "pending",
    bookingDate: "2025-05-18T14:45:00Z",
  },
  {
    id: "booking3",
    userId: "user3",
    userName: "Mohammed Patel",
    userEmail: "mohammed@example.com",
    animalId: "2",
    animalName: "Large Goat",
    shares: 1,
    totalAmount: 15000,
    status: "completed",
    bookingDate: "2025-05-10T09:15:00Z",
    notes: "Customer requested special packaging"
  },
  {
    id: "booking4",
    userId: "user4",
    userName: "Zahra Khan",
    userEmail: "zahra@example.com",
    animalId: "5",
    animalName: "Large Cow",
    shares: 3,
    totalAmount: 21000,
    status: "pending",
    bookingDate: "2025-05-20T11:00:00Z",
  },
  {
    id: "booking5",
    userId: "user5",
    userName: "Yasir Ahmed",
    userEmail: "yasir@example.com",
    animalId: "6",
    animalName: "Standard Goat",
    shares: 1,
    totalAmount: 12000,
    status: "cancelled",
    bookingDate: "2025-05-05T16:30:00Z",
    notes: "Customer cancelled due to travel plans"
  },
  {
    id: "booking6",
    userId: "user1",
    userName: "Ahmed Khan",
    userEmail: "ahmed@example.com",
    animalId: "4",
    animalName: "Premium Goat",
    shares: 1,
    totalAmount: 20000,
    status: "confirmed",
    bookingDate: "2025-05-16T13:20:00Z",
  },
  {
    id: "booking7",
    userId: "user6",
    userName: "Aisha Rahman",
    userEmail: "aisha@example.com",
    animalId: "1",
    animalName: "Premium Cow",
    shares: 1,
    totalAmount: 6000,
    status: "pending",
    bookingDate: "2025-05-19T09:45:00Z",
  },
];

// Booking API service
class BookingService extends ApiService<Booking> {
  private static instance: BookingService;

  private constructor() {
    super('https://localhost:7026/v1/UserBooking', mockBookings);
  }

  // Singleton pattern
  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  // Get all bookings with pagination and filtering
  async getBookings(page: number = 1, pageSize: number = 10, status?: string): Promise<{
    bookings: Booking[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      let endpoint = `/?page=${page}&pageSize=${pageSize}`;
      if (status && status !== 'all') {
        endpoint += `&status=${status}`;
      }
      
      const response = await this.get<{
        value: {
                 pageSize: number;
                 pageNumber: number;
                 totalCount: number;
                 totalPages: number;
                 data: Booking[];
               };
               isSuccess: boolean;
               errors: any[];
      }>(endpoint);
      
const { data, totalCount, totalPages } = response.data.value;
      return {
        bookings: data,
        totalItems: totalCount,
        totalPages: totalPages
      };    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      // Filter mock data based on status
      let filteredBookings = mockBookings;
      if (status && status !== 'all') {
        filteredBookings = mockBookings.filter(booking => booking.status === status);
      }
      
      // Calculate pagination for mock data
      const totalItems = filteredBookings.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedBookings = filteredBookings.slice(start, end);
      
      return {
        bookings: paginatedBookings,
        totalItems,
        totalPages
      };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      await this.put(`/${bookingId}/status`, { status });
      return true;
    } catch (error) {
      console.error(`Error updating booking status for booking ${bookingId}:`, error);
      // Mock successful update
      return true;
    }
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      const response = await this.get<Booking>(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking by ID ${id}:`, error);
      return mockBookings.find(booking => booking.id === id);
    }
  }
}

export const bookingService = BookingService.getInstance();
export { mockBookings };
