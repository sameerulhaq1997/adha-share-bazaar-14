
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService, User } from "@/services/userService";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

// Define the schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Define the schema for password update
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Mock update profile function
const updateProfile = async (data: ProfileFormValues): Promise<User> => {
  // This would normally be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '1',
        fullName: data.name,
        email: data.email,
        phone: data.phone,
      });
    }, 1000);
  });
};

// Mock update password function
const updatePassword = async (data: PasswordFormValues): Promise<boolean> => {
  // This would normally be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getCurrentUser(),
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Update password mutation
  const { mutate: updatePasswordMutation, isPending: isUpdatingPassword } = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      passwordForm.reset();
    },
    onError: () => {
      toast.error("Failed to update password");
    },
  });

  // Update user values when user data is loaded
  if (user && !profileForm.formState.isDirty) {
    profileForm.reset({
      name: user.fullName,
      email: user.email,
      phone: user.phone || "",
    });
  }

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation(data);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUser ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      {...profileForm.register("name")} 
                      placeholder="Your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...profileForm.register("email")} 
                      placeholder="Your email address"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input 
                      id="phone" 
                      {...profileForm.register("phone")} 
                      placeholder="Your phone number"
                    />
                    {profileForm.formState.errors.phone && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    {...passwordForm.register("currentPassword")} 
                    placeholder="Your current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    {...passwordForm.register("newPassword")} 
                    placeholder="Your new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    {...passwordForm.register("confirmPassword")} 
                    placeholder="Confirm your new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
