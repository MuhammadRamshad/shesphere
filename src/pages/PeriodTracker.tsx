
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, DropletIcon, SmileIcon, FrownIcon, ActivityIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPeriodData, savePeriodData } from "@/services/periodService";
import { IPeriodData } from "@/types";
import { authService } from "@/services/authService";

const flowOptions = [
  { value: "light", label: "Light", icon: <DropletIcon className="h-4 w-4 text-blue-400" /> },
  { value: "medium", label: "Medium", icon: <DropletIcon className="h-4 w-4 text-blue-500" /> },
  { value: "heavy", label: "Heavy", icon: <DropletIcon className="h-4 w-4 text-blue-600" /> },
];

const moodOptions = [
  { value: "happy", label: "Happy", icon: <SmileIcon className="h-4 w-4 text-green-500" /> },
  { value: "neutral", label: "Neutral", icon: <SmileIcon className="h-4 w-4 text-yellow-500" /> },
  { value: "sad", label: "Sad", icon: <FrownIcon className="h-4 w-4 text-red-500" /> },
  { value: "stressed", label: "Stressed", icon: <ActivityIcon className="h-4 w-4 text-orange-500" /> },
];

const symptomOptions = [
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "bloating", label: "Bloating" },
  { id: "fatigue", label: "Fatigue" },
  { id: "cravings", label: "Cravings" },
  { id: "acne", label: "Acne" },
  { id: "insomnia", label: "Insomnia" },
  { id: "nausea", label: "Nausea" },
];

// Function to process period data and calculate stats
const processPeriodData = (periodData: IPeriodData[] = []) => {
  // Default values if no data is available
  const today = new Date();
  let lastPeriodStart = subDays(today, 15);
  let nextPeriodPrediction = addDays(lastPeriodStart, 28);
  
  const periodDays: string[] = [];
  const fertileDays: string[] = [];
  
  if (periodData.length > 0) {
    // Sort data by date, newest first
    const sortedData = [...periodData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Find the last period start
    const lastPeriodEntry = sortedData.find(entry => entry.periodStart);
    
    if (lastPeriodEntry) {
      lastPeriodStart = new Date(lastPeriodEntry.date);
      
      // Calculate average cycle length if we have multiple period starts
      const periodStarts = sortedData.filter(entry => entry.periodStart);
      let avgCycleLength = 28; // Default
      
      if (periodStarts.length >= 2) {
        let totalDays = 0;
        for (let i = 0; i < periodStarts.length - 1; i++) {
          const daysDiff = Math.abs(
            (new Date(periodStarts[i].date).getTime() - new Date(periodStarts[i + 1].date).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          totalDays += daysDiff;
        }
        avgCycleLength = Math.round(totalDays / (periodStarts.length - 1));
      }
      
      // Predict next period
      nextPeriodPrediction = addDays(lastPeriodStart, avgCycleLength);
      
      // Find period days
      // Get all entries with flow not null (indicating period day)
      const allPeriodDays = sortedData.filter(entry => entry.flow !== null);
      allPeriodDays.forEach(entry => {
        periodDays.push(format(new Date(entry.date), 'yyyy-MM-dd'));
      });
      
      // Calculate fertile window (typically days 11-16 of cycle)
      const fertileStart = addDays(lastPeriodStart, 11);
      const fertileEnd = addDays(lastPeriodStart, 16);
      
      let currentDay = fertileStart;
      while (currentDay <= fertileEnd) {
        fertileDays.push(format(currentDay, 'yyyy-MM-dd'));
        currentDay = addDays(currentDay, 1);
      }
      
      return {
        averageCycleLength: avgCycleLength,
        lastPeriodStart: format(lastPeriodStart, 'yyyy-MM-dd'),
        nextPeriodPrediction: format(nextPeriodPrediction, 'yyyy-MM-dd'),
        periodDays,
        fertileDays,
        fertile: {
          start: format(fertileStart, 'yyyy-MM-dd'),
          end: format(fertileEnd, 'yyyy-MM-dd'),
        }
      };
    }
  }
  
  // Default return if no period data available
  return {
    averageCycleLength: 28,
    lastPeriodStart: format(lastPeriodStart, 'yyyy-MM-dd'),
    nextPeriodPrediction: format(nextPeriodPrediction, 'yyyy-MM-dd'),
    periodDays,
    fertileDays,
    fertile: {
      start: format(addDays(lastPeriodStart, 11), 'yyyy-MM-dd'),
      end: format(addDays(lastPeriodStart, 16), 'yyyy-MM-dd'),
    }
  };
};

const PeriodTracker = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(false);
  const [periodEnd, setPeriodEnd] = useState(false);
  const [flow, setFlow] = useState<string | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isInitialSetupOpen, setIsInitialSetupOpen] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(undefined);
  
  const queryClient = useQueryClient();
  
  // Get User ID from authentication - in a real app, this would come from authentication
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.email || "guest_user";
  
  // Query for period data - now using authenticated user ID
  const { data: periodData, isLoading } = useQuery({
    queryKey: ['periodData', userId],
    queryFn: () => getPeriodData(userId),
  });
  
  // Check if this is the first time using the tracker
  useEffect(() => {
    if (!isLoading && periodData && periodData.length === 0) {
      // Check localStorage to see if we've shown the initial setup before
      const hasSetupBeenShown = localStorage.getItem(`periodTrackerSetupShown_${userId}`);
      if (!hasSetupBeenShown) {
        setIsInitialSetupOpen(true);
      }
    }
  }, [isLoading, periodData, userId]);
  
  // Process period data to get stats
  const cycleData = processPeriodData(periodData);
  
  // Create mutation for saving period data
  const mutation = useMutation({
    mutationFn: (data: any) => savePeriodData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodData', userId] });
      toast.success("Period data saved successfully");
      setIsDialogOpen(false);
      
      // Reset form
      setPeriodStart(false);
      setPeriodEnd(false);
      setFlow(null);
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setNotes("");
    },
    onError: (error) => {
      console.error("Error saving period data:", error);
      toast.error("Failed to save period data");
    }
  });

  // Initial setup mutation - save last period start date
  const initialSetupMutation = useMutation({
    mutationFn: (lastPeriodStartDate: Date) => {
      return savePeriodData({
        userId,
        date: lastPeriodStartDate,
        periodStart: true,
        periodEnd: false,
        symptoms: [],
        flow: "medium",
        mood: [],
        notes: "Initial period start date"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodData', userId] });
      toast.success("Initial period data saved successfully");
      setIsInitialSetupOpen(false);
      
      // Mark setup as shown - now user-specific
      localStorage.setItem(`periodTrackerSetupShown_${userId}`, 'true');
    },
    onError: (error) => {
      console.error("Error saving initial period data:", error);
      toast.error("Failed to save initial period data");
    }
  });

  const handleInitialSetupSubmit = () => {
    if (lastPeriodDate) {
      initialSetupMutation.mutate(lastPeriodDate);
    } else {
      toast.error("Please select your last period start date");
    }
  };

  const handleSubmit = async () => {
    const periodData = {
      userId,
      date,
      periodStart,
      periodEnd,
      symptoms: selectedSymptoms,
      flow,
      mood: selectedMoods,
      notes
    };
    
    console.log('Submitting period data:', periodData);
    
    // Actually save the data
    mutation.mutate(periodData);
  };

  const toggleMood = (value: string) => {
    setSelectedMoods(prev => 
      prev.includes(value) 
        ? prev.filter(mood => mood !== value) 
        : [...prev, value]
    );
  };

  const toggleSymptom = (value: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(value) 
        ? prev.filter(symptom => symptom !== value) 
        : [...prev, value]
    );
  };

  // Function to determine day state for calendar
  const isDayInPeriod = (day: Date) => {
    return cycleData.periodDays.includes(format(day, 'yyyy-MM-dd'));
  };

  const isDayFertile = (day: Date) => {
    return cycleData.fertileDays.includes(format(day, 'yyyy-MM-dd'));
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  

  // Calculate cycle statistics
  const stats = {
    averageCycleLength: cycleData.averageCycleLength,
    lastPeriodStart: cycleData.lastPeriodStart,
    nextPeriodPrediction: cycleData.nextPeriodPrediction,
    fertile: cycleData.fertile
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Period Tracker</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your cycle, symptoms, and mood to get personalized insights and predictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-she-pink/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-she-dark">Your Cycle Calendar</CardTitle>
              <CardDescription>
                Track your period, fertile window, and log symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-2 bg-white rounded-lg">
              <Calendar
                 mode="single"
                 selected={date}
                 onSelect={(newDate) => newDate && setDate(newDate)}
                 className="rounded-md border pointer-events-auto"
                 modifiers={{
                 period: (date) => isDayInPeriod(date),
                 fertile: (date) => isDayFertile(date),
                 today: (date) => isToday(date),  // Add this modifier to check for today's date
                }}
                modifiersClassNames={{
                    period: "bg-she-pink text-white hover:bg-she-pink/90",
                    fertile: "bg-she-lavender/50 text-she-indigo hover:bg-she-lavender/60", // Adjust opacity for fertile days to make today more visible
                    today: "bg-she-gold text-black hover:bg-she-gold/80 z-20 border-2 border-black shadow-lg", 
                    selected:
                    "bg-she-indigo text-white font-semibold hover:bg-she-indigo/90 border-2 border-she-purple",                    }}
                />

              </div>
              <div className="flex items-center justify-around mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-she-pink"></div>
                  <span>Period</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-she-lavender/30"></div>
                  <span>Fertile Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-she-purple"></div>
                  <span>Ovulation</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    className="bg-she-purple hover:bg-she-indigo text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Log Period Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Log period data</DialogTitle>
                    <DialogDescription>
                      Record your period details for {format(date, 'MMMM d, yyyy')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="period" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="period">Period</TabsTrigger>
                      <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="period" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="periodStart" 
                            checked={periodStart}
                            onCheckedChange={(checked) => 
                              setPeriodStart(checked === true)
                            }
                          />
                          <Label htmlFor="periodStart">Period started today</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="periodEnd" 
                            checked={periodEnd}
                            onCheckedChange={(checked) => 
                              setPeriodEnd(checked === true)
                            }
                          />
                          <Label htmlFor="periodEnd">Period ended today</Label>
                        </div>
                        
                        {periodStart && (
                          <div className="space-y-2">
                            <Label>Flow intensity</Label>
                            <div className="flex space-x-2">
                              {flowOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  type="button"
                                  variant={flow === option.value ? "default" : "outline"}
                                  className={cn(
                                    "flex-1",
                                    flow === option.value ? "bg-she-purple text-white" : ""
                                  )}
                                  onClick={() => setFlow(option.value)}
                                >
                                  {option.icon}
                                  <span className="ml-2">{option.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label>Mood</Label>
                          <div className="flex flex-wrap gap-2">
                            {moodOptions.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={selectedMoods.includes(option.value) ? "default" : "outline"}
                                className={cn(
                                  selectedMoods.includes(option.value) ? "bg-she-purple text-white" : ""
                                )}
                                onClick={() => toggleMood(option.value)}
                              >
                                {option.icon}
                                <span className="ml-2">{option.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="symptoms" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {symptomOptions.map((symptom) => (
                          <div key={symptom.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={symptom.id} 
                              checked={selectedSymptoms.includes(symptom.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  toggleSymptom(symptom.id);
                                } else {
                                  toggleSymptom(symptom.id);
                                }
                              }}
                            />
                            <Label htmlFor={symptom.id}>{symptom.label}</Label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="notes">
                      <Textarea 
                        placeholder="Add any additional notes about how you're feeling today..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSubmit}
                      className="bg-she-purple hover:bg-she-indigo text-white"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Stats and Insights Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-she-pink/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-she-dark">Cycle Insights</CardTitle>
              <CardDescription>Your personalized cycle predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Average Cycle Length</div>
                <div className="text-2xl font-semibold text-she-dark">{stats.averageCycleLength} days</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Last Period</div>
                <div className="text-lg font-medium text-she-dark">
                  {format(new Date(stats.lastPeriodStart), 'MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Next Period (Predicted)</div>
                <div className="text-lg font-medium text-she-purple">
                  {format(new Date(stats.nextPeriodPrediction), 'MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-500">Fertile Window</div>
                <div className="text-md font-medium text-she-indigo">
                  {format(new Date(stats.fertile.start), 'MMM d')} - {format(new Date(stats.fertile.end), 'MMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Symptoms and Health Insights Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-she-lavender/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-she-dark">Health Insights</CardTitle>
              <CardDescription>Based on your recent entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-she-lavender/10 rounded-lg">
                  <h4 className="font-medium text-she-dark mb-1">Common Symptoms</h4>
                  <p className="text-sm text-gray-600">
                    {isLoading ? "Loading your symptoms data..." : 
                      selectedSymptoms.length > 0 
                        ? `You frequently experience ${selectedSymptoms.join(', ')} during your period.`
                        : "Start tracking your symptoms to get personalized insights."}
                  </p>
                </div>
                
                <div className="p-4 bg-she-light rounded-lg">
                  <h4 className="font-medium text-she-dark mb-1">Mood Patterns</h4>
                  <p className="text-sm text-gray-600">
                    {isLoading ? "Loading your mood data..." : 
                      selectedMoods.length > 0
                        ? `Your mood tends to be ${selectedMoods.join(', ')} during your period.`
                        : "Log your moods to help identify patterns throughout your cycle."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-she-lavender/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-she-dark">Recommendations</CardTitle>
              <CardDescription>Personalized tips for your cycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-she-lavender/30 flex items-center justify-center flex-shrink-0">
                    <DropletIcon className="h-4 w-4 text-she-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium text-she-dark">Hydration</h4>
                    <p className="text-sm text-gray-600">
                      Increase your water intake during your period to help with bloating and cramps.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-she-lavender/30 flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className="h-4 w-4 text-she-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium text-she-dark">Exercise</h4>
                    <p className="text-sm text-gray-600">
                      Light exercises like yoga or walking can help reduce period pain and improve your mood.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-she-lavender/30 flex items-center justify-center flex-shrink-0">
                    <SmileIcon className="h-4 w-4 text-she-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium text-she-dark">Self-care</h4>
                    <p className="text-sm text-gray-600">
                      Schedule some relaxation time during your period to help manage stress and emotions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Initial setup dialog */}
      <Dialog open={isInitialSetupOpen} onOpenChange={setIsInitialSetupOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Welcome to Period Tracker</DialogTitle>
            <DialogDescription>
              To get started, please tell us when your last period started. This will help us personalize your cycle predictions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="lastPeriod" className="block mb-2">When did your last period start?</Label>
            <div className="p-2 bg-white rounded-lg border">
              <Calendar
                mode="single"
                selected={lastPeriodDate}
                onSelect={setLastPeriodDate}
                disabled={(date) => date > new Date()}
                className="rounded-md border"
              />
            </div>
            
            {/* Adding some help text */}
            <p className="text-sm text-gray-500 mt-2">
              Select your most recent period start date to help us calculate your cycle more accurately.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={handleInitialSetupSubmit}
              className="bg-she-purple hover:bg-she-indigo text-white w-full"
              disabled={!lastPeriodDate || initialSetupMutation.isPending}
            >
              {initialSetupMutation.isPending ? "Saving..." : "Save and Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PeriodTracker;
