
import { ApiService } from '@/lib/axios';
import { format, addMinutes, parseISO, startOfDay, setHours, setMinutes } from 'date-fns';

// Define the event type
export interface CalendarEvent {
  id: number;
  date: string; // ISO string format
  startTime: string; // Time in format "HH:mm"
  endTime: string; // Time in format "HH:mm"
  duration: number; // Duration in minutes
  animals: string[];
  location: string;
  type: 'slaughter' | 'collection';
}

// Generate time slots for a given day (every 30 minutes from 8:00 AM to 6:00 PM)
const generateTimeSlots = (baseDate: Date): { start: string, end: string }[] => {
  const slots: { start: string, end: string }[] = [];
  const startTime = setHours(setMinutes(startOfDay(baseDate), 0), 8); // 8:00 AM
  
  for (let i = 0; i < 20; i++) { // 20 slots of 30 minutes = 10 hours (8 AM to 6 PM)
    const slotStartTime = addMinutes(startTime, i * 30);
    const slotEndTime = addMinutes(slotStartTime, 30);
    
    slots.push({
      start: format(slotStartTime, 'HH:mm'),
      end: format(slotEndTime, 'HH:mm')
    });
  }
  
  return slots;
};

// Function to create detailed events with time slots
const createTimeBasedEvents = (events: Omit<CalendarEvent, 'startTime' | 'endTime' | 'duration'>[]): CalendarEvent[] => {
  return events.map(event => {
    const eventDate = parseISO(event.date);
    const timeSlots = generateTimeSlots(eventDate);
    
    // Assign a random time slot from the available slots
    const randomSlotIndex = Math.floor(Math.random() * timeSlots.length);
    const selectedSlot = timeSlots[randomSlotIndex];
    
    // Random duration between 1-3 slots (30-90 minutes)
    const durationSlots = Math.floor(Math.random() * 3) + 1;
    const duration = durationSlots * 30;
    
    return {
      ...event,
      startTime: selectedSlot.start,
      endTime: timeSlots[Math.min(randomSlotIndex + durationSlots, timeSlots.length - 1)].end,
      duration
    };
  });
};

// Create events spaced throughout May 20, 2025
const createEventsForDay = (date: Date, count: number, type: 'slaughter' | 'collection'): Omit<CalendarEvent, 'startTime' | 'endTime' | 'duration'>[] => {
  const events: Omit<CalendarEvent, 'startTime' | 'endTime' | 'duration'>[] = [];
  const locations = type === 'slaughter' 
    ? ["Central Facility", "East Facility", "West Facility", "North Facility", "South Facility"]
    : ["Distribution Center A", "Distribution Center B", "Distribution Center C", "Distribution Center D", "Distribution Center E"];
  
  const animalTypes = [
    ["Premium Cow", "Large Goat"],
    ["Medium Cow"],
    ["Standard Goat"],
    ["Medium Cow", "Standard Goat"],
    ["Large Cow", "Premium Goat"],
    ["Premium Cow", "Medium Goat"],
    ["Standard Cow", "Large Goat"]
  ];
  
  for (let i = 0; i < count; i++) {
    events.push({
      id: i + 1,
      date: date.toISOString(),
      animals: animalTypes[i % animalTypes.length],
      location: locations[i % locations.length],
      type
    });
  }
  
  return events;
};

// Create a full day of events for May 20, 2025 (more events to show a busy day)
const may20 = new Date(2025, 4, 20); // May 20, 2025
const mockSlaughterEvents = createTimeBasedEvents([
  ...createEventsForDay(may20, 12, 'slaughter'),
  ...createEventsForDay(new Date(2025, 4, 22), 2, 'slaughter'),
  ...createEventsForDay(new Date(2025, 4, 25), 2, 'slaughter'),
  ...createEventsForDay(new Date(2025, 4, 27), 2, 'slaughter'),
  ...createEventsForDay(new Date(2025, 4, 29), 2, 'slaughter'),
  ...createEventsForDay(new Date(2025, 5, 2), 2, 'slaughter'),
  ...createEventsForDay(new Date(2025, 5, 5), 2, 'slaughter')
]);

// Mock data for the collection events
const mockCollectionEvents = createTimeBasedEvents([
  ...createEventsForDay(new Date(2025, 4, 21), 3, 'collection'),
  ...createEventsForDay(new Date(2025, 4, 23), 3, 'collection'),
  ...createEventsForDay(new Date(2025, 4, 26), 3, 'collection'),
  ...createEventsForDay(new Date(2025, 4, 28), 3, 'collection'),
  ...createEventsForDay(new Date(2025, 4, 30), 3, 'collection')
]);

// Calendar API service
class CalendarService extends ApiService<CalendarEvent> {
  private static instance: CalendarService;

  private constructor() {
    // Pass mockEvents as fallback data
    super('https://api.example.com/calendar', [...mockSlaughterEvents, ...mockCollectionEvents]);
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
      if (!response.data || response.data.length === 0) {
        // If API returns empty array, use mock data
        return type === 'slaughter' ? mockSlaughterEvents : mockCollectionEvents;
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} events:`, error);
      return type === 'slaughter' ? mockSlaughterEvents : mockCollectionEvents;
    }
  }
}

export const calendarService = CalendarService.getInstance();
export { mockSlaughterEvents, mockCollectionEvents };
