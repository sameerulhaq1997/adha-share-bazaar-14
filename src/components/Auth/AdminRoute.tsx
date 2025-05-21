
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { userService } from "@/services/userService";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const isAdmin = localStorage.getItem("role") == "Admin";
        
        // For demo purposes, check if user is logged in
        // In a real app, you'd check a specific admin field on the user object
        if (isAdmin) {
          // Mock check: assuming user with id "1" is an admin
          setIsAdmin(isAdmin);
        }
        
        // If not admin, show a toast
        if (!isAdmin) {
          toast.error("You don't have permission to access this page");
        }
      } catch (error) {
        toast.error("Authentication error. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

export default AdminRoute;
