
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  ShoppingCart
} from "lucide-react";
import { userService } from "@/services/userService";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext"; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { getTotalItems } = useCart();

  // Check auth status on initial load and when location changes
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = () => {
    const isAuthenticated = userService.checkAuth();
    if (isAuthenticated) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem("userName") || "User");
      setIsAdmin(localStorage.getItem("isAdmin") === "true");
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setIsAdmin(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
    setIsLoggedIn(false);
    setUserName("");
    setIsAdmin(false);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const cartItemCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/lovable-uploads/400574e6-7b15-4fa2-a10f-85b42c0b8051.png" alt="Qurbani Connect Logo" className="h-10 w-auto" />
          <span className="font-bold text-xl text-brand-600">Qurbani Connect</span>
        </Link>
        
        <nav className="ml-auto hidden md:flex gap-6">
          <Link to="/" className="text-sm font-medium hover:text-brand-600 transition-colors">
            Home
          </Link>
          <Link to="/animals" className="text-sm font-medium hover:text-brand-600 transition-colors">
            Animals
          </Link>
          <Link to="/calendar" className="text-sm font-medium hover:text-brand-600 transition-colors">
            Calendar
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-brand-600 transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-brand-600 transition-colors">
            Contact
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin/animals" className="text-sm font-medium hover:text-brand-600 transition-colors">
                Manage Animals
              </Link>
              <Link to="/admin/bookings" className="text-sm font-medium hover:text-brand-600 transition-colors">
                Manage Bookings
              </Link>
            </>
          )}
        </nav>
        
        <div className="ml-auto md:ml-6 flex items-center gap-4">
          <Link to="/cart" className="relative text-foreground hover:text-brand-600">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/animals">Manage Animals</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/bookings">Manage Bookings</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link to="/" className="text-lg font-medium hover:text-brand-600 transition-colors">
                  Home
                </Link>
                <Link to="/animals" className="text-lg font-medium hover:text-brand-600 transition-colors">
                  Animals
                </Link>
                <Link to="/calendar" className="text-lg font-medium hover:text-brand-600 transition-colors">
                  Calendar
                </Link>
                <Link to="/about" className="text-lg font-medium hover:text-brand-600 transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-lg font-medium hover:text-brand-600 transition-colors">
                  Contact
                </Link>
                
                {isAdmin && (
                  <>
                    <div className="pt-2 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">Admin</span>
                    <Link to="/admin/animals" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Manage Animals
                    </Link>
                    <Link to="/admin/bookings" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Manage Bookings
                    </Link>
                  </>
                )}
                
                <div className="pt-2 border-t border-border"></div>
                
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Profile
                    </Link>
                    <Link to="/dashboard" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-lg font-medium text-red-500 hover:text-red-600 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Login
                    </Link>
                    <Link to="/register" className="text-lg font-medium hover:text-brand-600 transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
