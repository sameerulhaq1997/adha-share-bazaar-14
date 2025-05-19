
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { Check, ShoppingCart } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateShareCount, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    // In a real application, this would navigate to a checkout page
    // or integrate with a payment gateway
    setIsCheckingOut(true);
    setTimeout(() => {
      toast({
        title: "Checkout functionality not implemented yet",
        description: "Please connect Supabase to enable checkout.",
      });
      setIsCheckingOut(false);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 sm:px-8 py-12 min-h-[calc(100vh-4rem)]">
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            You haven't added any animal shares to your cart yet.
          </p>
          <Button asChild className="bg-brand-600 hover:bg-brand-700">
            <Link to="/animals">Browse Animals</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-8 py-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-brand-200">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover aspect-video sm:aspect-square"
                    />
                  </div>
                  <div className="w-full sm:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </p>
                      </div>
                      <span className="text-brand-700 font-bold">
                        PKR {item.totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Shares:</span>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.shares > 1) {
                                updateShareCount(item.id, item.shares - 1);
                              }
                            }}
                            disabled={item.shares <= 1}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.shares}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                updateShareCount(item.id, value);
                              }
                            }}
                            className="h-8 w-12 text-center mx-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateShareCount(item.id, item.shares + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
                  <span>PKR {item.totalPrice.toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">PKR {getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button
                className="w-full bg-brand-600 hover:bg-brand-700"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/animals")}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
