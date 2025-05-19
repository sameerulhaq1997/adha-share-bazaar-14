
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import AnimalListing from "./pages/AnimalListing";
import AnimalDetail from "./pages/AnimalDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import AnimalManagement from "./pages/admin/AnimalManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import { CartProvider } from "./contexts/CartContext";
import AdminRoute from "./components/Auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/animals" element={<AnimalListing />} />
              <Route path="/animal/:id" element={<AnimalDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin routes protected by AdminRoute component */}
              <Route path="/admin/animals" element={
                <AdminRoute>
                  <AnimalManagement />
                </AdminRoute>
              } />
              <Route path="/admin/bookings" element={
                <AdminRoute>
                  <BookingManagement />
                </AdminRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
