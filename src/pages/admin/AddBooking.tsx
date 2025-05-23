
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { bookingService, Booking } from "@/services/bookingService";
import { userService } from "@/services/userService";
import { animalService, Animal } from "@/services/animalService";

// Form validation schema
const formSchema = z.object({
  // User fields
  userName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  userEmail: z.string().email({ message: "Please enter a valid email address." }),
  userPhone: z.string().optional(),
  
  // Booking fields
  animalId: z.string({
    required_error: "Please select an animal.",
  }),
  shares: z.number().int().positive({ message: "Shares must be a positive number." }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddBooking = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userPhone: "",
      animalId: "",
      shares: 1,
      notes: "",
    },
  });

  // Load animals on mount
  useState(() => {
    const fetchAnimals = async () => {
      try {
        const animalsData = await animalService.getAllAnimals();
        setAnimals(animalsData);
        setIsLoadingAnimals(false);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
        toast.error("Failed to load animals");
        setIsLoadingAnimals(false);
      }
    };
    
    fetchAnimals();
  });

  // Handle animal selection to update price calculation
  const handleAnimalChange = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    setSelectedAnimal(animal || null);
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // First, check if user with email exists
      let userId: string;
      try {
        // Simulate user creation or lookup
        userId = await userService.register({
          name: data.userName,
          email: data.userEmail,
          password: "tempPassword123", // This would be handled differently in a real app
          phone: data.userPhone
        }).then(user => user.id);
      } catch (error) {
        console.error("Error creating/finding user:", error);
        throw new Error("Failed to process user information");
      }
      
      // Now create the booking
      const animal = animals.find(a => a.id === data.animalId);
      if (!animal) throw new Error("Selected animal not found");
      
      const bookingData: Partial<Booking> = {
        userId,
        userName: data.userName,
        userEmail: data.userEmail,
        animalId: data.animalId,
        animalName: animal.name,
        shares: data.shares,
        totalAmount: animal.pricePerShare ? animal.pricePerShare * data.shares : animal.price,
        status: "confirmed",
        bookingDate: new Date().toISOString(),
        notes: data.notes
      };
      
      // Call booking service to create booking
      return bookingService.updateBookingStatus("new", "confirmed");
    },
    onSuccess: () => {
      toast.success("Booking created successfully");
      navigate("/admin/bookings");
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    createBookingMutation.mutate(data);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Add New Booking</h1>
      <p className="text-muted-foreground mb-6">Create a booking on behalf of a customer</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
          <CardDescription>
            Enter customer details and booking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium">Customer Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="userEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="customer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="userPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium">Booking Details</h2>
                    
                    <FormField
                      control={form.control}
                      name="animalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Animal</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleAnimalChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an animal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingAnimals ? (
                                <SelectItem value="loading" disabled>Loading animals...</SelectItem>
                              ) : animals.length === 0 ? (
                                <SelectItem value="none" disabled>No animals available</SelectItem>
                              ) : (
                                animals.map((animal) => (
                                  <SelectItem key={animal.id} value={animal.id}>
                                    {animal.name} - ₹{animal.price.toLocaleString()}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shares"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Shares</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedAnimal && (
                      <div className="p-4 bg-secondary rounded-md">
                        <p className="text-sm font-medium">Booking Summary</p>
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Animal:</span> {selectedAnimal.name}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Price per share:</span> ₹{(selectedAnimal.pricePerShare || selectedAnimal.price).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Total amount:</span> ₹{((selectedAnimal.pricePerShare || selectedAnimal.price) * (form.watch('shares') || 1)).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any special instructions or notes"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/bookings')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBooking;
