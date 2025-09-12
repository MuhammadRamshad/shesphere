import React, { useState, useEffect } from "react";
import { PhoneCall, Plus, UserPlus, MapPin, Check, AlertTriangle, X, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSafetyContacts, createSafetyContact, deleteSafetyContact, getSafetyAlerts, createSafetyAlert } from "@/services/safetyService";
import AppLayout from "@/components/AppLayout";
import { ISafetyContact, ISafetyAlert } from "@/types";
import { authService } from "@/services/authService";
import { format } from "date-fns";

const SafetyAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContact, setNewContact] = useState({ 
    name: "", 
    phoneNumber: "", 
    email:"",
    relationship: "",
    isEmergencyContact: true 
  });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertNotes, setAlertNotes] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Get current user for filtering data
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.email || "guest_user";
  
  // Query safety contacts for the current user only
  const { 
    data: contacts = [], 
    isLoading: isContactsLoading 
  } = useQuery({
    queryKey: ['safetyContacts', userId],
    queryFn: () => getSafetyContacts(userId),
  });
  
  // Query safety alerts for the current user only
  const { 
    data: alerts = [], 
    isLoading: isAlertsLoading 
  } = useQuery({
    queryKey: ['safetyAlerts', userId],
    queryFn: () => getSafetyAlerts(userId),
  });
  
  // Get current location when alert dialog opens or when page loads
  useEffect(() => {
    if (isAlertModalOpen) {
      setLocationLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location Error",
              description: "Unable to get your current location. Alerts will be sent without location data.",
              variant: "destructive"
            });
            setLocationLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        toast({
          title: "Location Not Available",
          description: "Geolocation is not supported by your browser. Alerts will be sent without location data.",
          variant: "destructive"
        });
        setLocationLoading(false);
      }
    }
  }, [isAlertModalOpen, toast]);
  
  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: (contact: Omit<ISafetyContact, "_id">) => createSafetyContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safetyContacts', userId] });
      toast({
        title: "Contact Added",
        description: "Emergency contact has been added successfully."
      });
      setIsContactModalOpen(false);
      setNewContact({ 
        name: "", 
        phoneNumber: "", 
        email:"",
        relationship: "",
        isEmergencyContact: true 
      });
    },
    onError: (error) => {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add emergency contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => deleteSafetyContact(contactId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safetyContacts', userId] });
      toast({
        title: "Contact Removed",
        description: "Emergency contact has been removed."
      });
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to remove emergency contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (alert: Omit<ISafetyAlert, "_id">) => 
      createSafetyAlert(alert, true, true), // Explicitly set sendSMS and sendEmail to true
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safetyAlerts', userId] });
      toast({
        title: "Alert Sent",
        description: "Emergency alert has been sent to all your contacts."
      });
      setIsAlertModalOpen(false);
      setAlertNotes("");
    },
    onError: (error) => {
      console.error("Error creating alert:", error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleAddContact = () => {
    // Simple validation
    if (!newContact.name || !newContact.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and phone number.",
        variant: "destructive"
      });
      return;
    }
    
    // Create contact with current user ID
    const contactData: Omit<ISafetyContact, "_id"> = {
      userId,
      name: newContact.name,
      phone: newContact.phoneNumber, // Changed from phoneNumber to phone to match the interface
      phoneNumber: newContact.phoneNumber,
      email: newContact.email, // Keep phoneNumber for backward compatibility
      relationship: newContact.relationship,
      isEmergencyContact: newContact.isEmergencyContact
    };
    
    addContactMutation.mutate(contactData);
  };
  
  const handleDeleteContact = (contactId: string) => {
    if (window.confirm("Are you sure you want to remove this emergency contact?")) {
      deleteContactMutation.mutate(contactId);
    }
  };
  
  const handleSendAlert = () => {
    // Get all contact IDs to notify everyone
    const allContactIds = contacts.map(contact => contact._id!);
    
    // Create alert with current user ID and all contacts
    const alertData: Omit<ISafetyAlert, "_id"> = {
      userId,
      timestamp: new Date(),
      location: currentLocation ? {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      } : undefined,
      alertType: "emergency", // This is now explicitly typed as "emergency"
      status: "active",
      contactsNotified: allContactIds,
      notes: alertNotes
    };
    
    console.log("Sending alert with data:", alertData);
    
    // Call the createSafetyAlert function with explicit flags
    createAlertMutation.mutate(alertData);
  };
  
  // Format timestamp for display
  const formatAlertTime = (timestamp: Date) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Safety Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your emergency contacts and safety alerts. Your safety is our top priority.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-she-indigo/20 shadow-md h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-she-dark">Emergency Alerts</CardTitle>
                  <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Send Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Emergency Alert</DialogTitle>
                        <DialogDescription>
                          This will send an alert to ALL your emergency contacts with your current location.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="alertNotes">Alert Details (Optional)</Label>
                          <Textarea
                            id="alertNotes"
                            placeholder="Add any important details about your situation"
                            value={alertNotes}
                            onChange={(e) => setAlertNotes(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Contacts to be Notified</Label>
                          {contacts.length > 0 ? (
                            <div className="space-y-2">
                              {contacts.map((contact) => (
                                <div key={contact._id} className="flex items-center justify-between p-3 border rounded-md bg-she-lavender/10">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-she-lavender flex items-center justify-center text-she-indigo">
                                      {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                      <p className="font-medium">{contact.name}</p>
                                      <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                                      
                                    </div>
                                  </div>
                                  <Check className="h-4 w-4 text-she-indigo" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-4 border rounded-md">
                              <p className="text-gray-500">No emergency contacts added yet.</p>
                              <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => {
                                  setIsAlertModalOpen(false);
                                  setIsContactModalOpen(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" /> Add Contact First
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Location Status</Label>
                          <div className="flex items-center p-3 border rounded-md bg-gray-50">
                            <MapPin className="h-5 w-5 text-she-purple mr-2" />
                            <p className="text-sm text-gray-600">
                              {locationLoading ? (
                                "Acquiring your location..."
                              ) : currentLocation ? (
                                "Your current location will be shared with the alert"
                              ) : (
                                "Unable to get your location. Allow location access to share your position."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAlertModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleSendAlert}
                          disabled={createAlertMutation.isPending || contacts.length === 0}
                        >
                          {createAlertMutation.isPending ? "Sending..." : "Send Emergency Alert"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  View your alert history and send emergency alerts to your trusted contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="history">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="history">Alert History</TabsTrigger>
                    <TabsTrigger value="map">Safety Map</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="history" className="space-y-4">
                    {isAlertsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-she-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your alert history...</p>
                      </div>
                    ) : alerts.length > 0 ? (
                      <div className="space-y-4">
                        {alerts.map((alert) => (
                          <div key={alert._id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  alert.status === 'active' ? 'bg-red-100 text-red-600' :
                                  alert.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                  'bg-yellow-100 text-yellow-600'
                                }`}>
                                  {alert.status === 'active' ? <AlertTriangle className="h-4 w-4" /> :
                                   alert.status === 'resolved' ? <Check className="h-4 w-4" /> :
                                   <X className="h-4 w-4" />}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">
                                    {alert.alertType === 'emergency' ? 'Emergency Alert' :
                                     alert.alertType === 'check-in' ? 'Check-in Request' :
                                     'Test Alert'}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatAlertTime(alert.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                alert.status === 'active' ? 'bg-red-100 text-red-600' :
                                alert.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {alert.status === 'active' ? 'Active' :
                                 alert.status === 'resolved' ? 'Resolved' :
                                 'False Alarm'}
                              </span>
                            </div>
                            
                            {alert.notes && (
                              <p className="text-sm text-gray-600 mt-2 border-t pt-2">{alert.notes}</p>
                            )}
                            
                            {alert.location && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>Location shared with this alert</span>
                                </div>
                              </div>
                            )}
                            
                            {alert.contactsNotified && alert.contactsNotified.length > 0 && (
                              <div className="mt-2 border-t pt-2">
                                <p className="text-xs text-gray-500 mb-1">Contacts notified:</p>
                                <div className="flex flex-wrap gap-2">
                                  {alert.contactsNotified.map((contactId, index) => {
                                    const contact = contacts.find(c => c._id === contactId);
                                    return (
                                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {contact ? contact.name : 'Unknown contact'}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">No alerts have been sent yet</p>
                        <p className="text-sm text-gray-400">
                          When you send an emergency alert, it will appear here
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="map">
                    <div className="border rounded-lg overflow-hidden h-80 bg-gray-50">
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Safety Map Feature</p>
                          <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
                            This feature will display a map with your saved safe zones and alert locations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-she-indigo/20 shadow-md h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-she-dark">Emergency Contacts</CardTitle>
                  <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-she-indigo text-she-indigo hover:bg-she-lavender/10">
                        <UserPlus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Emergency Contact</DialogTitle>
                        <DialogDescription>
                          Add trusted contacts who should be notified in case of emergency.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            className="col-span-3"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phoneNumber" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phoneNumber"
                            placeholder="+91 9876543210"
                            className="col-span-3"
                            value={newContact.phoneNumber}
                            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="email"
                            placeholder="xyz@gmail.com"
                            className="col-span-3"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="relationship" className="text-right">
                            Relation
                          </Label>
                          <Input
                            id="relationship"
                            placeholder="Friend, Family, etc."
                            className="col-span-3"
                            value={newContact.relationship}
                            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsContactModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
                          {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage trusted contacts who will be notified in emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isContactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-she-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your contacts...</p>
                  </div>
                ) : contacts.length > 0 ? (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-she-lavender/20 flex items-center justify-center text-she-indigo font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{contact.name}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <PhoneCall className="h-3 w-3 mr-1" />
                              <span>{contact.phoneNumber}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <PhoneCall className="h-3 w-3 mr-1" />
                              <span>{contact.email}</span>
                            </div>
                            {contact.relationship && (
                              <p className="text-xs text-gray-400 mt-1">{contact.relationship}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteContact(contact._id!)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <UserPlus className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-2">No emergency contacts added yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Add trusted contacts who should be notified in case of emergency
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsContactModalOpen(true)}
                      className="border-she-indigo text-she-indigo hover:bg-she-lavender/10"
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Add Your First Contact
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-gray-500 italic">
                  Your emergency contacts will receive SMS notifications with your location when you trigger an alert.
                </p>
              </CardFooter>
            </Card>
            
            {/* Safety Checklist Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-she-indigo/20 shadow-md mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-she-dark text-lg">Safety Checklist</CardTitle>
                <CardDescription>
                  Essential safety steps to follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Add at least 3 emergency contacts</p>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Enable location services for accurate alerts</p>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Schedule regular check-ins with trusted contacts</p>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Test the emergency alert system with a trusted contact</p>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Create safe zones on your safety map</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SafetyAlerts;
