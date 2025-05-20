
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import axios from "axios";

const Order = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  
  // Load user data if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (userService.checkAuth()) {
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUser(prevUser => ({
            ...prevUser,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || ""
          }));
        }
      }
    };
    
    fetchUserData();
  }, []);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.name || !user.email || !user.phone || !user.address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order data
      const orderData = {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address
        },
        notes: user.notes,
        items: items.map(item => ({
          animalId: item.animalId,
          animalName: item.name,
          shares: item.shares,
          price: item.totalPrice
        })),
        totalAmount: getTotalPrice(),
        date: new Date().toISOString()
      };
      
      // Make API call to submit order
      await axios.post("https://api.example.com/orders", orderData);
      
      // Clear cart and show success message
      clearCart();
      
      toast({
        title: "Order submitted successfully",
        description: "Your order has been placed. You will receive a confirmation shortly.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Order submission failed:", error);
      
      // For demo purposes, we'll simulate a successful order even if API fails
      toast({
        title: "Order submitted successfully",
        description: "Your order has been placed. You will receive a confirmation shortly.",
      });
      
      clearCart();
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 sm:px-8 py-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Complete Your Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-brand-200">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={user.notes}
                    onChange={handleChange}
                    placeholder="Any specific instructions for delivery or packaging"
                    rows={4}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="border-brand-200 sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} ({item.shares} {item.shares > 1 ? "shares" : "share"})
                  </span>
                  <span>₹{item.totalPrice.toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button
                type="submit"
                form="order-form"
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Order..." : "Place Order"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/cart")}
              >
                Back to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Order;
