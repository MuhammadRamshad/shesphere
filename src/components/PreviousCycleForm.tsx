
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { savePeriodData } from "@/services/periodService";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreviousCycleFormProps {
  onComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviousCycleForm: React.FC<PreviousCycleFormProps> = ({
  onComplete,
  open,
  onOpenChange
}) => {
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState<Date | undefined>(undefined);
  const [lastPeriodEndDate, setLastPeriodEndDate] = useState<Date | undefined>(undefined);
  const [typicalCycleLength, setTypicalCycleLength] = useState<string>("28");
  const [typicalPeriodLength, setTypicalPeriodLength] = useState<string>("5");
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const cycleLengthOptions = Array.from({ length: 15 }, (_, i) => (21 + i).toString());
  const periodLengthOptions = Array.from({ length: 10 }, (_, i) => (3 + i).toString());
  
  const symptomOptions = [
    { id: "cramps", label: "Cramps" },
    { id: "headache", label: "Headache" },
    { id: "bloating", label: "Bloating" },
    { id: "fatigue", label: "Fatigue" },
    { id: "acne", label: "Acne" },
    { id: "mood_swings", label: "Mood Swings" },
    { id: "breast_tenderness", label: "Breast Tenderness" },
    { id: "backache", label: "Backache" }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lastPeriodStartDate || !currentUser) {
      toast({
        title: "Missing information",
        description: "Please provide at least your last period start date.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the last period start with user email as identifier
      await savePeriodData({
        userId: currentUser.email,
        date: lastPeriodStartDate,
        periodStart: true,
        periodEnd: false,
        symptoms: commonSymptoms,
        flow: "medium",
        mood: [],
        notes: "Initial period start data"
      });
      
      // If end date is provided, save that too
      if (lastPeriodEndDate) {
        await savePeriodData({
          userId: currentUser.email,
          date: lastPeriodEndDate,
          periodStart: false,
          periodEnd: true,
          symptoms: [],
          flow: "light",
          mood: [],
          notes: "Initial period end data"
        });
      }
      
      // Store cycle length and period length in localStorage for future reference
      // But associate it with the specific user
      localStorage.setItem(`typicalCycleLength_${currentUser.email}`, typicalCycleLength);
      localStorage.setItem(`typicalPeriodLength_${currentUser.email}`, typicalPeriodLength);
      
      // Mark user as not new anymore so drawer doesn't show again
      authService.setUserAsNotNew();
      
      toast({
        title: "Cycle data saved",
        description: "Your cycle information has been saved successfully.",
      });
      
      // Navigate to period tracker page after completion
      setTimeout(() => {
        onComplete();
        // Redirect to period tracker page after data collection
        navigate("/period-tracker");
      }, 500);
    } catch (error) {
      console.error("Error saving cycle data:", error);
      toast({
        title: "Error saving data",
        description: "An error occurred while saving your cycle data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    // Mark user as not new anyway
    if (currentUser) {
      authService.setUserAsNotNew();
    }
    onComplete();
    
    // Still navigate to period-tracker - they just won't have initial data
    navigate("/period-tracker");
  };
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Welcome to SheSphere!</DrawerTitle>
            <DrawerDescription>
              Tell us about your menstrual cycle to get more accurate predictions.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[60vh] px-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="lastPeriodStart">When did your last period start?</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="lastPeriodStart"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !lastPeriodStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastPeriodStartDate ? format(lastPeriodStartDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={lastPeriodStartDate}
                        onSelect={setLastPeriodStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPeriodEnd">When did your last period end?</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="lastPeriodEnd"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !lastPeriodEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastPeriodEndDate ? format(lastPeriodEndDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={lastPeriodEndDate}
                        onSelect={setLastPeriodEndDate}
                        initialFocus
                        disabled={(date) => !lastPeriodStartDate || date < lastPeriodStartDate}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Typical cycle length (days)</Label>
                  <Select value={typicalCycleLength} onValueChange={setTypicalCycleLength}>
                    <SelectTrigger id="cycleLength" className="w-full">
                      <SelectValue placeholder="Select cycle length" />
                    </SelectTrigger>
                    <SelectContent>
                      {cycleLengthOptions.map(length => (
                        <SelectItem key={length} value={length}>{length} days</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The average cycle is 28 days, from the first day of one period to the first day of the next.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="periodLength">Typical period length (days)</Label>
                  <Select value={typicalPeriodLength} onValueChange={setTypicalPeriodLength}>
                    <SelectTrigger id="periodLength" className="w-full">
                      <SelectValue placeholder="Select period length" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodLengthOptions.map(length => (
                        <SelectItem key={length} value={length}>{length} days</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Common symptoms during your period</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomOptions.map(symptom => (
                      <div key={symptom.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`symptom-${symptom.id}`} 
                          checked={commonSymptoms.includes(symptom.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCommonSymptoms([...commonSymptoms, symptom.id]);
                            } else {
                              setCommonSymptoms(commonSymptoms.filter(s => s !== symptom.id));
                            }
                          }}
                        />
                        <Label htmlFor={`symptom-${symptom.id}`} className="text-sm font-normal">
                          {symptom.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Any other information you'd like to track"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </ScrollArea>
          <DrawerFooter>
            <Button type="button" onClick={handleSubmit} className="bg-she-purple hover:bg-she-indigo w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Cycle Data"
              )}
            </Button>
            <Button variant="outline" onClick={handleSkip}>
              Skip for now
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PreviousCycleForm;
