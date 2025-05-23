
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { animalService, Animal } from "@/services/animalService";
import { configService } from "@/services/configService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImages, setShowImages] = useState(configService.getShowProductImages());

  useEffect(() => {
    const fetchAnimal = async () => {
      setIsLoading(true);
      try {
        const animalData = await animalService.getAnimalById(id);
        setAnimal(animalData);
      } catch (error) {
        console.error("Failed to fetch animal:", error);
        setAnimal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);
  
  // Listen for image display setting changes
  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      setShowImages(event.detail.showProductImages);
    };

    window.addEventListener(
      'product-images-setting-changed', 
      handleConfigChange as EventListener
    );
    
    return () => {
      window.removeEventListener(
        'product-images-setting-changed',
        handleConfigChange as EventListener
      );
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">Loading animal details...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {isLoading ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">Loading animal details...</h3>
        </div>
        
        {/* Right Column - Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{animal.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-brand-100 text-brand-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {capitalize(animal.category)}
            </span>
            <span className="bg-secondary text-secondary-foreground text-sm font-medium px-2.5 py-0.5 rounded">
              {availableShares} {availableShares === 1 ? "share" : "shares"} available
            </span>
            {sharesInCart > 0 && (
              <span className="bg-brand-600 text-white text-sm font-medium px-2.5 py-0.5 rounded">
                {sharesInCart} in cart
              </span>
            )}
          </div>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-2xl font-bold">PKR {formatNumber(animal.pricePerShare)}</span>
            <span className="text-sm text-muted-foreground">per share</span>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Booking Status:</span>
              <span className="font-medium">
                {animal.bookedShares}/{animal.totalShares} shares booked
              </span>
            </div>
            <div className="progress-bar bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500"
                style={{ 
                  width: `${(animal.bookedShares / animal.totalShares) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground">Breed</h3>
              <p className="font-medium">{animal.breed}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Weight</h3>
              <p className="font-medium">{animal.weight} kg</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Age</h3>
              <p className="font-medium">{animal.age || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Total Price</h3>
              <p className="font-medium">PKR {formatNumber(animal.price)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm">{animal.description}</p>
          </div>
          
          {animal.features && animal.features.length > 0 && (
            <div className="space-y-2 mb-6">
              {animal.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Details Section */}
          <div className={`${!showImages ? "md:col-span-2" : ""}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{animal.name}</CardTitle>
                <CardDescription>{animal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    ₹{animal.price ? animal.price.toLocaleString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{animal.category}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">PKR {formatNumber(totalPrice)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shares</span>
                    <p className="font-medium">
                      {animal.remainingShares}/{animal.totalShares} remaining
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/cart">Add to Cart</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Tabs for Additional Information */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Specifications</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
            <TabsTrigger value="care" className="flex-1">Care & Handling</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-4">About {animal.name}</h3>
            <p className="mb-4">{animal.description}</p>
            <p>
              This animal has been carefully selected for Qurbani, ensuring it meets all Islamic requirements.
              The animal is healthy, well-fed, and raised in humane conditions in accordance with Islamic principles.
            </p>
          </TabsContent>
          <TabsContent value="details" className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Animal Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Breed</h4>
                <p className="text-muted-foreground">{animal.breed}</p>
              </div>
              <div>
                <h4 className="font-medium">Weight</h4>
                <p className="text-muted-foreground">{animal.weight} kg</p>
              </div>
              <div>
                <h4 className="font-medium">Age</h4>
                <p className="text-muted-foreground">{animal.age || "Not specified"}</p>
              </div>
              <div>
                <h4 className="font-medium">Category</h4>
                <p className="text-muted-foreground">{capitalize(animal.category)}</p>
              </div>
              <div>
                <h4 className="font-medium">Total Shares</h4>
                <p className="text-muted-foreground">{animal.totalShares}</p>
              </div>
              <div>
                <h4 className="font-medium">Price per Share</h4>
                <p className="text-muted-foreground">PKR {formatNumber(animal.pricePerShare)}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="bookings" className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Current Bookings</h3>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading booking information...</p>
              </div>
            ) : users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              {/* <p className="text-xs text-muted-foreground">{user.email}</p> */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.shares}</TableCell>
                        <TableCell>{new Date(user.bookingDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {capitalize(user.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No bookings have been made for this animal yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="care" className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Care & Handling</h3>
            <p className="mb-4">
              Our animals are handled with the utmost care in accordance with Islamic principles.
              Here's how we ensure proper treatment before Qurbani:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Animals are provided with clean water and nutritious food</li>
              <li>Shelter from extreme weather conditions</li>
              <li>Regular veterinary check-ups to ensure good health</li>
              <li>Compassionate treatment at all times</li>
              <li>Transport with care to minimize stress</li>
              <li>Sacrificed according to Islamic guidelines</li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimalDetail;
