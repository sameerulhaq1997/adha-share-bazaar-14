
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { bookingService } from "@/services/bookingService";

const BookingManagement = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const pageSize = 5;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["bookings", page, statusFilter],
    queryFn: () => bookingService.getBookings(page, pageSize, statusFilter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) => 
      bookingService.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      toast.success("Booking status updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update booking status");
    },
  });

  const handleStatusChange = (bookingId: string, status: string) => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
      <p className="text-muted-foreground mb-6">View and manage Qurbani bookings</p>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle>Customer Bookings</CardTitle>
              <CardDescription>
                Showing {data?.bookings.length || 0} of {data?.totalItems || 0} bookings
              </CardDescription>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Booking Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.animalName}</TableCell>
                        <TableCell className="text-right">{booking.shares}</TableCell>
                        <TableCell className="text-right">₹{booking.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={booking.status}
                            onValueChange={(value) => handleStatusChange(booking.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirm</SelectItem>
                              <SelectItem value="completed">Complete</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {data?.totalPages || 1}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, data?.totalPages || 1))}
                    disabled={page === data?.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;
