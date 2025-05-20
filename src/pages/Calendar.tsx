
import { useState, useCallback } from "react";
import { format, parseISO, isSameDay, addDays, setHours, setMinutes, getHours, getMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { calendarService, CalendarEvent } from "@/services/calendarService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate time slots from 8:00 AM to 6:00 PM with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({ hour, minute: 0 });
    slots.push({ hour, minute: 30 });
  }
  
  return slots;
};

const timeSlots = generateTimeSlots();

const CalendarView = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarType, setCalendarType] = useState<"slaughter" | "collection">("slaughter");
  
  // Fetch events based on calendar type
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar', calendarType],
    queryFn: () => calendarService.getEventsByType(calendarType),
    onError: () => {
      toast.error("Failed to load calendar events", {
        description: "Using cached data instead.",
      });
    }
  });

  // Get events for the selected date
  const getEventsForDate = useCallback((date: Date | undefined) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
  }, [events]);
  
  // Generate all dates that have events
  const getDatesWithEvents = useCallback(() => {
    return events.map(event => parseISO(event.date));
  }, [events]);

  const selectedDateEvents = getEventsForDate(selectedDate);
  const datesWithEvents = getDatesWithEvents();

  // Function to navigate to the next or previous day
  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate(current => {
      return direction === 'next' ? addDays(current, 1) : addDays(current, -1);
    });
  };

  // Convert time string to date object for positioning
  const timeToDate = (timeString: string, baseDate: Date) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return setMinutes(setHours(baseDate, hours), minutes);
  };

  // Calculate position and height for an event
  const calculateEventPosition = (event: CalendarEvent, baseDate: Date) => {
    const startTime = timeToDate(event.startTime, baseDate);
    const endTime = timeToDate(event.endTime, baseDate);
    
    const dayStart = setHours(setMinutes(baseDate, 0), 8); // 8:00 AM
    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    const startMinutesSinceDayStart = 
      (getHours(startTime) - getHours(dayStart)) * 60 + 
      (getMinutes(startTime) - getMinutes(dayStart));
    
    // Each 30-min slot is 60px high, plus 1px for the border
    const posFromTop = (startMinutesSinceDayStart / 30) * 61;
    const height = (totalMinutes / 30) * 61 - 2; // -2 for border
    
    return { top: posFromTop, height };
  };

  return (
    <div className="container px-4 sm:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Qurbani Calendar</h1>
      <p className="text-muted-foreground mb-8">
        View and plan slaughter and meat collection schedules for your Qurbani shares.
      </p>
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6" />
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  {calendarType === "slaughter" ? "Slaughter Schedule" : "Collection Schedule"}
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Day</span>
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Calendar</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border pointer-events-auto"
                      modifiers={{
                        booked: datesWithEvents,
                      }}
                      modifiersStyles={{
                        booked: { 
                          backgroundColor: calendarType === "slaughter" ? "#FECACA" : "#BFDBFE",
                          color: calendarType === "slaughter" ? "#991B1B" : "#1E40AF",
                          fontWeight: "bold"
                        }
                      }}
                      components={{
                        DayContent: ({ date, ...props }) => {
                          const isBooked = datesWithEvents.some(d => isSameDay(d, date));
                          
                          return (
                            <div 
                              {...props}
                              className={cn(
                                "relative flex h-9 w-9 items-center justify-center",
                                isBooked && "font-bold"
                              )}
                            >
                              {date.getDate()}
                              {isBooked && (
                                <div 
                                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                                    calendarType === "slaughter" ? "bg-red-600" : "bg-blue-600"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        },
                      }}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('next')}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next Day</span>
                </Button>
              </div>
            </div>

            <Tabs 
              value={calendarType}
              className="mt-4"
              onValueChange={(value) => setCalendarType(value as "slaughter" | "collection")}
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="slaughter">Slaughter</TabsTrigger>
                <TabsTrigger value="collection">Collection</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-[60px_1fr] border rounded-lg">
                  {/* Time column */}
                  <div className="border-r">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="h-[60px] border-b flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {format(setMinutes(setHours(selectedDate, slot.hour), slot.minute), 'h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Events column */}
                  <div className="relative">
                    {/* Grid Lines */}
                    {timeSlots.map((_, index) => (
                      <div key={index} className="h-[60px] border-b"></div>
                    ))}

                    {/* Events */}
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map((event) => {
                        const { top, height } = calculateEventPosition(event, selectedDate);
                        
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "absolute w-[95%] rounded-md p-2 border overflow-hidden",
                              event.type === "slaughter" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                            )}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: '2.5%'
                            }}
                          >
                            <div className="flex flex-col h-full">
                              <div className="flex justify-between">
                                <span className="font-medium text-sm truncate">
                                  {event.type === "slaughter" ? "Slaughter" : "Collection"}
                                </span>
                                <span className="text-xs">
                                  {event.startTime} - {event.endTime}
                                </span>
                              </div>
                              
                              {height > 70 && (
                                <>
                                  <p className="text-xs mt-1 line-clamp-1">{event.location}</p>
                                  {height > 90 && (
                                    <div className="text-xs mt-1">
                                      {event.animals.map((animal, idx) => (
                                        <Badge 
                                          key={idx}
                                          variant="outline" 
                                          className="mr-1 mb-1"
                                        >
                                          {animal}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                          <h3 className="mt-4 text-lg font-medium">No events scheduled</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            There are no {calendarType} events scheduled for {format(selectedDate, "PPP")}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" size="sm">
                      Add Event
                    </Button>
                    <Button variant="outline" size="sm">
                      Today
                    </Button>
                    <Button variant="outline" size="sm">
                      View Week
                    </Button>
                    <Button variant="outline" size="sm">
                      Print Schedule
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
