import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Check, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { animalService, Animal } from "@/services/animalService";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [shareCount, setShareCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [addingToCart, setAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState<Animal | null>(null);
  
  // Fetch the animal details based on ID
  useEffect(() => {
    const fetchAnimal = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await animalService.getAnimalById(id);
        if (data) {
          setAnimal(data);
          console.log("Animal data received:", data); // Debug log
        } else {
          console.error("No animal data returned for ID:", id);
        }
      } catch (error) {
        console.error("Failed to fetch animal details:", error);
        toast({
          title: "Error",
          description: "Failed to load animal details. Using cached data if available.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimal();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container px-4 sm:px-8 py-32 text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading Animal Details...</h2>
      </div>
    );
  }
  
  if (!animal) {
    return (
      <div className="container px-4 sm:px-8 py-32 text-center">
        <h2 className="text-2xl font-semibold mb-4">Animal Not Found</h2>
        <p className="mb-8">The animal you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/animals">Browse Available Animals</Link>
        </Button>
      </div>
    );
  }
  
  const totalPrice = shareCount * (animal.pricePerShare || 0);
  
  const handleShareCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= animal.remainingShares) {
      setShareCount(value);
    }
  };

  const handleAddToCart = () => {
    setAddingToCart(true);
    
    // Add item to cart
    addToCart({
      animalId: animal.id,
      name: animal.name,
      category: animal.category,
      imageUrl: animal.imageUrl,
      sharePrice: animal.pricePerShare || 0,
      shares: shareCount,
      totalPrice: totalPrice
    });
    
    // Show success toast
    toast({
      title: "Added to cart",
      description: `${shareCount} ${shareCount > 1 ? 'shares' : 'share'} of ${animal.name} added to your cart.`,
    });
    
    setAddingToCart(false);
  };

  // Check how many shares of this animal are already in the cart
  const sharesInCart = items
    .filter(item => item.animalId === animal.id)
    .reduce((total, item) => total + item.shares, 0);
  
  const availableShares = animal.remainingShares - sharesInCart;

  // Helper function to safely capitalize a string
  const capitalize = (str: string | undefined) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper function to safely format numbers with toLocaleString
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="container px-4 sm:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Images */}
        <div className="w-full md:w-1/2">
          <div className="rounded-lg overflow-hidden mb-4 border">
            <img
              src={animal.additionalImages ? animal.additionalImages[selectedImage] : animal.imageUrl}
              alt={animal.name}
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
          
          {animal.additionalImages && animal.additionalImages.length > 0 && (
            <div className="flex space-x-2">
              {animal.additionalImages.map((image, index) => (
                <div
                  key={index}
                  className={`border overflow-hidden rounded cursor-pointer w-20 h-20 ${
                    selectedImage === index ? "ring-2 ring-brand-500" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${animal.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
            <div className="progress-bar bg-muted">
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
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Book Your Share</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shares">Number of Shares</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => shareCount > 1 && setShareCount(shareCount - 1)}
                      disabled={shareCount <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="shares"
                      type="number"
                      min={1}
                      max={availableShares}
                      value={shareCount}
                      onChange={handleShareCountChange}
                      className="max-w-16 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => shareCount < availableShares && setShareCount(shareCount + 1)}
                      disabled={shareCount >= availableShares}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    defaultValue="online"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">Online Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">PKR {formatNumber(totalPrice)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-brand-600 hover:bg-brand-700"
                      disabled={addingToCart || availableShares === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </Button>
                    
                    <Button asChild className="flex-1 bg-brand-600 hover:bg-brand-700">
                      <Link to="/cart">
                        View Cart
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <p>
                      By proceeding, you agree to our terms and conditions. Bookings are confirmed upon payment.
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tabs for Additional Information */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Specifications</TabsTrigger>
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
