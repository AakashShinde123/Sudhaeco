import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";

// Schema for profile update form
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", API_ENDPOINTS.UPDATE_PROFILE, data);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Update user in context
        updateUser({
          name: form.getValues().name,
          email: form.getValues().email,
          phone: form.getValues().phone,
          address: form.getValues().address,
        });
        
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 pb-16 flex flex-col items-center justify-center flex-1">
          <div className="text-center p-6 max-w-md mx-auto">
            <span className="material-icons text-neutral-400 text-6xl mb-4">account_circle</span>
            <h2 className="text-xl font-semibold mb-2">Login to View Profile</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Please login to view and manage your profile.
            </p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pb-16">
        <div className="my-4">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            My Profile
          </h1>
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-4">
                <span className="material-icons text-primary-600 dark:text-primary-400 text-3xl">
                  account_circle
                </span>
              </div>
              <div>
                <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
                  {user?.name || user?.username}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400">{user?.email}</p>
              </div>
              <Button 
                variant="outline"
                className="ml-auto"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    {...form.register("name")}
                    placeholder="Your Name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    {...form.register("email")}
                    placeholder="your.email@example.com"
                    type="email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    {...form.register("phone")}
                    placeholder="Your Phone Number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Textarea 
                    {...form.register("address")}
                    placeholder="Your Delivery Address"
                    rows={3}
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-xs">{form.formState.errors.address.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Phone</h3>
                  <p className="text-neutral-900 dark:text-neutral-100">{user?.phone}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email</h3>
                  <p className="text-neutral-900 dark:text-neutral-100">{user?.email || "Not set"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Default Address</h3>
                  <p className="text-neutral-900 dark:text-neutral-100">{user?.address || "Not set"}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <a href="/orders">
                My Orders
                <span className="material-icons">chevron_right</span>
              </a>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <a href="/saved-addresses">
                Saved Addresses
                <span className="material-icons">chevron_right</span>
              </a>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <a href="/payment-methods">
                Payment Methods
                <span className="material-icons">chevron_right</span>
              </a>
            </Button>
            
            <Button 
              variant="destructive"
              className="w-full mt-6"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
