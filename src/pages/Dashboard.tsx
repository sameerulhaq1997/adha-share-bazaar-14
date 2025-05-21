
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { userService, User, UserBooking } from "@/services/userService";
import { bookingService } from "@/services/bookingService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const isAuth = userService.checkAuth();
        if (!isAuth) {
          toast({
            title: "Authentication required",
            description: "Please login to access this page.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        const userData = await userService.getCurrentUser();
        debugger;
        if (userData) {
          setUser(userData);
          const bookingsData = await bookingService.getUserBookings();
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your account information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
              ;

    fetchUserData();
  }, [navigate]);
  
  const handleLogout = () => {
    userService.logout();
    toast({
      title: "Logged out",
      description: "You have successfully logged out.",
    });
    navigate("/login");
  };
  
  if (loading) {
    return (
      <div className="container px-4 sm:px-8 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-xl font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-8 py-8 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground block">Name</span>
                <span className="font-medium">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              {user?.phone && (
                <div>
                  <span className="text-sm text-muted-foreground block">Phone</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">My Bookings</CardTitle>
            <CardDescription>Your current and past bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold">{bookings.length}</span>
              <span className="text-sm text-muted-foreground">Total bookings</span>
            </div>
            <Button asChild size="sm" className="w-full mt-4 bg-brand-600 hover:bg-brand-700">
              <Link to="#my-bookings">View All Bookings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Cart</CardTitle>
            <CardDescription>Your current cart items</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-brand-600 hover:bg-brand-700">
              <Link to="/cart">Go to Cart</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div id="my-bookings" className="mt-12">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <BookingsList bookings={bookings} />
          </TabsContent>
          
          <TabsContent value="confirmed">
            <BookingsList 
              bookings={bookings.filter(booking => booking.status === 'confirmed')} 
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <BookingsList 
              bookings={bookings.filter(booking => booking.status === 'pending')} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const BookingsList = ({ bookings }: { bookings: UserBooking[] }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary rounded-lg">
        <p className="text-muted-foreground">No bookings found.</p>
        <Button asChild className="mt-4 bg-brand-600 hover:bg-brand-700">
          <Link to="/animals">Browse Animals</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <Card key={booking.id} className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{booking.animalName}</h3>
              <StatusBadge status={booking.status} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-muted-foreground block">Booking ID</span>
                <span className="font-medium">{booking.id}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Shares</span>
                <span className="font-medium">{booking.shares}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Date</span>
                <span className="font-medium">{booking.bookingDate}</span>
              </div>
            </div>
            
            <Button asChild size="sm" className="bg-brand-600 hover:bg-brand-700">
              <Link to={`/animal/${booking.animalId}`}>
                View Animal
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-600">Confirmed</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
    case 'completed':
      return <Badge className="bg-blue-600">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default Dashboard;
