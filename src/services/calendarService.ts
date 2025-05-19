
import { ApiService } from '@/lib/axios';

// Define the event type
export interface CalendarEvent {
  id: number;
  date: string; // ISO string format
  animals: string[];
  location: string;
  type: 'slaughter' | 'collection';
}

// Mock data for the slaughter events
const mockSlaughterEvents: CalendarEvent[] = [
  { id: 1, date: new Date(2025, 5, 20).toISOString(), animals: ["Premium Cow", "Large Goat"], location: "Central Facility", type: 'slaughter' },
  { id: 2, date: new Date(2025, 5, 22).toISOString(), animals: ["Medium Cow", "Standard Goat"], location: "East Facility", type: 'slaughter' },
  { id: 3, date: new Date(2025, 5, 25).toISOString(), animals: ["Large Cow", "Premium Goat"], location: "West Facility", type: 'slaughter' },
  { id: 4, date: new Date(2025, 5, 27).toISOString(), animals: ["Premium Cow", "Medium Goat"], location: "North Facility", type: 'slaughter' },
  { id: 5, date: new Date(2025, 5, 29).toISOString(), animals: ["Standard Cow", "Large Goat"], location: "South Facility", type: 'slaughter' },
];

// Mock data for the collection events
const mockCollectionEvents: CalendarEvent[] = [
  { id: 1, date: new Date(2025, 5, 21).toISOString(), animals: ["Premium Cow", "Large Goat"], location: "Distribution Center A", type: 'collection' },
  { id: 2, date: new Date(2025, 5, 23).toISOString(), animals: ["Medium Cow", "Standard Goat"], location: "Distribution Center B", type: 'collection' },
  { id: 3, date: new Date(2025, 5, 26).toISOString(), animals: ["Large Cow", "Premium Goat"], location: "Distribution Center C", type: 'collection' },
  { id: 4, date: new Date(2025, 5, 28).toISOString(), animals: ["Premium Cow", "Medium Goat"], location: "Distribution Center D", type: 'collection' },
  { id: 5, date: new Date(2025, 5, 30).toISOString(), animals: ["Standard Cow", "Large Goat"], location: "Distribution Center E", type: 'collection' },
];

// Calendar API service
class CalendarService extends ApiService<CalendarEvent> {
  private static instance: CalendarService;

  private constructor() {
    // Pass mockAnimals as fallback data
    super('https://localhost:7026/calendar', [...mockSlaughterEvents, ...mockCollectionEvents]);
  }

  // Singleton pattern to ensure only one instance is created
  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Get all events
  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await this.get<CalendarEvent[]>('/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [...mockSlaughterEvents, ...mockCollectionEvents];
    }
  }

  // Get events by type
  async getEventsByType(type: 'slaughter' | 'collection'): Promise<CalendarEvent[]> {
    try {
      const response = await this.get<CalendarEvent[]>(`/events?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} events:`, error);
      return type === 'slaughter' ? mockSlaughterEvents : mockCollectionEvents;
    }
  }
}

export const calendarService = CalendarService.getInstance();
export { mockSlaughterEvents, mockCollectionEvents };
