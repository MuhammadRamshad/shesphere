
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { User, UserCircle, Mail, Phone, Calendar, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCurrentUser, updateUserProfile } from '@/services/userService';
import { IUser } from '@/types';
import { useQuery, useMutation } from '@tanstack/react-query';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user data from API
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  // Initialize form state with user data or defaults
  const [formData, setFormData] = useState<Partial<IUser>>({
    name: '',
    email: '',
    phoneNumber: '',
    bio: ''
  });

  // Update form state when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber || '',
        bio: userData.bio || ''
      });
    }
  }, [userData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleLogout = () => {
    // Clear any auth tokens, user data, etc.
    localStorage.removeItem('currentUser');
    
    setLogoutDialogOpen(false);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to home page
    navigate('/');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
          <p>Loading profile data...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !userData) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
          <p>Error loading profile data. Please try again later.</p>
        </div>
      </AppLayout>
    );
  }

  const nameInitial = formData.name?.charAt(0).toUpperCase() || 'U';

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-she-dark mb-2">My Profile</h1>
          <p className="text-gray-600">View and edit your personal information</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Card */}
          <Card className="w-full md:w-1/3 bg-white">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  {formData.avatarUrl ? (
                    <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                  ) : (
                    <AvatarFallback className="text-3xl bg-she-lavender/30 text-she-purple">
                      {nameInitial}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <CardTitle className="text-xl font-bold text-she-dark">{formData.name}</CardTitle>
              <CardDescription className="text-gray-500">{formData.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <div className="text-gray-600 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <Phone size={16} className="text-she-indigo" />
                  {formData.phoneNumber || 'No phone number'}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Calendar size={16} className="text-she-indigo" />
                  Member since {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 border-red-300"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut size={16} className="mr-2" />
                Log Out
              </Button>
            </CardFooter>
          </Card>

          {/* Edit Profile Form */}
          <Card className="w-full md:w-2/3 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="text-she-purple" />
                {isEditing ? 'Edit Profile' : 'Profile Information'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Update your personal information below'
                  : 'Your personal information and settings'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <User size={14} />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail size={14} />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-1">
                    <Phone size={14} />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-1">
                    About Me
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about yourself"
                    disabled={!isEditing}
                    className="resize-none"
                    rows={4}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-she-purple hover:bg-she-indigo"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    className="bg-she-purple hover:bg-she-indigo ml-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out of your account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600"
              >
                Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
