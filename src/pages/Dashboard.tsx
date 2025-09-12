import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getPeriodData } from "@/services/periodService";
import { getAllSymptoms } from "@/services/symptomService";
import { getSafetyContacts } from "@/services/safetyService";
import { IPeriodData, ISymptom, ISafetyContact } from "@/types";
import { authService } from "@/services/authService";
import PreviousCycleForm from "@/components/PreviousCycleForm";

const Dashboard = () => {
  const [periodData, setPeriodData] = useState<IPeriodData[]>([]);
  const [symptoms, setSymptoms] = useState<ISymptom[]>([]);
  const [safetyContacts, setSafetyContacts] = useState<ISafetyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!currentUser || !currentUser.email) {
          setLoading(false);
          navigate('/login'); // Redirect to login if not authenticated
          return;
        }
        
        // Use email as identifier for consistency
        const userId = currentUser.email;
        
        // Fetch data in parallel
        const [periodDataResult, symptomsResult, safetyContactsResult] = await Promise.all([
          getPeriodData(userId),
          getAllSymptoms(),
          getSafetyContacts(userId)
        ]);
        
        setPeriodData(periodDataResult as IPeriodData[]);
        setSymptoms(symptomsResult as unknown as ISymptom[]);
        setSafetyContacts(safetyContactsResult as ISafetyContact[]);
        
        // Show cycle form if no period data exists
        if (!periodDataResult || periodDataResult.length === 0) {
          setShowCycleForm(true);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleCycleFormComplete = () => {
    setShowCycleForm(false);
    // Refresh period data after form submission
    if (currentUser && currentUser.email) {
      getPeriodData(currentUser.email).then(data => {
        setPeriodData(data as IPeriodData[]);
      });
    }
  };
  
  // Calculate next period date based on actual data
  const calculateNextPeriod = (): number => {
    // If we have period data and at least one entry with periodStart=true
    if (periodData && periodData.length > 0) {
      const periodStarts = periodData
        .filter(entry => entry.periodStart)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (periodStarts.length >= 2) {
        // Calculate average cycle length from the last few cycles
        let totalDays = 0;
        let cycles = 0;
        
        for (let i = 0; i < periodStarts.length - 1; i++) {
          const currentStart = new Date(periodStarts[i].date);
          const prevStart = new Date(periodStarts[i + 1].date);
          const daysDiff = Math.round((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0 && daysDiff < 45) { // Sanity check to exclude outliers
            totalDays += daysDiff;
            cycles++;
          }
        }
        
        const avgCycleLength = cycles > 0 ? Math.round(totalDays / cycles) : 28;
        const lastPeriodDate = new Date(periodStarts[0].date);
        const today = new Date();
        
        // Calculate next period date
        const nextPeriodDate = new Date(lastPeriodDate);
        nextPeriodDate.setDate(lastPeriodDate.getDate() + avgCycleLength);
        
        // Calculate days until next period
        const daysUntil = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 ? daysUntil : 0;
      } else if (periodStarts.length === 1) {
        // If we only have one period start, use the typical cycle length stored for this user
        const lastPeriodDate = new Date(periodStarts[0].date);
        const today = new Date();
        
        // Try to get user-specific cycle length
        let avgCycleLength = 28;
        if (currentUser && currentUser.email) {
          const storedCycleLength = localStorage.getItem(`typicalCycleLength_${currentUser.email}`);
          if (storedCycleLength) {
            avgCycleLength = parseInt(storedCycleLength);
          }
        }
        
        // Calculate next period date
        const nextPeriodDate = new Date(lastPeriodDate);
        nextPeriodDate.setDate(lastPeriodDate.getDate() + avgCycleLength);
        
        // Calculate days until next period
        const daysUntil = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 ? daysUntil : 0;
      }
    }
    
    return 14; // Default fallback value
  };
  
  // Get recent activity from period data - improve accuracy
  const getRecentActivity = () => {
    if (!periodData || periodData.length === 0) {
      return [
        { date: "Today", activity: "Started using SheSphere", icon: "👋", color: "bg-she-purple/20" },
        { date: "Today", activity: "Created account", icon: "📝", color: "bg-she-blue/20" }
      ];
    }
    
    // Sort period data by date (most recent first)
    const sortedData = [...periodData].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Transform period data into activity items
    return sortedData.slice(0, 4).map((entry) => {
      const entryDate = new Date(entry.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dateText = "Today";
      if (diffDays === 1) dateText = "Yesterday";
      else if (diffDays > 1) dateText = `${diffDays} days ago`;
      
      let activity = "";
      let icon = "📆";
      let color = "bg-she-blue/20";
      
      if (entry.periodStart) {
        activity = "Period started";
        icon = "📅";
        color = "bg-she-pink/20";
      } else if (entry.periodEnd) {
        activity = "Period ended";
        icon = "📆";
        color = "bg-she-blue/20";
      } else if (entry.symptoms && entry.symptoms.length > 0) {
        activity = `Logged symptom: ${Array.isArray(entry.symptoms) ? entry.symptoms.join(', ') : entry.symptoms}`;
        icon = "🤕";
        color = "bg-she-lavender/20";
      } else if (entry.mood) {
        activity = `Logged mood: ${Array.isArray(entry.mood) ? entry.mood.join(', ') : entry.mood}`;
        icon = "😊";
        color = "bg-she-indigo/20";
      } else {
        activity = "Updated cycle data";
      }
      
      return { date: dateText, activity, icon, color };
    });
  };
  
  const daysUntilNextPeriod = calculateNextPeriod();
  const cycleProgress = Math.min(100, (28 - daysUntilNextPeriod) / 28 * 100);
  const recentActivity = getRecentActivity();
  const userName = currentUser?.name?.split(' ')[0] || 'User';
  
  // Make sure we only count emergency contacts for THIS user
  const emergencyContactsCount = safetyContacts ? 
    safetyContacts.filter(contact => contact.isEmergencyContact).length : 0;
  
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Welcome back, {userName}</h1>
          <p className="text-gray-600">Here's an overview of your health and safety</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Period Tracker Card */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-she-dark flex items-center gap-2">
                <Calendar className="text-she-purple" size={20} />
                Period Tracker
              </CardTitle>
              <CardDescription>Track your cycle and symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Next period in</span>
                  <span className="font-semibold text-she-purple">{daysUntilNextPeriod} days</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-gradient-to-r from-she-pink to-she-purple h-2 rounded-full" 
                    style={{ width: `${cycleProgress}%` }}
                  ></div>
                </div>
              </div>
              <Button asChild className="w-full bg-she-lavender hover:bg-she-purple text-white">
                <Link to="/period-tracker">View Cycle</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Safety Alerts Card */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-she-dark flex items-center gap-2">
                <Shield className="text-she-indigo" size={20} />
                Safety Alerts
              </CardTitle>
              <CardDescription>Your personal safety companion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-2">
                <p className="text-gray-600">Emergency contacts: <span className="font-semibold">{emergencyContactsCount}</span></p>
                <div className="flex items-center text-sm text-green-600 gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Safety system is active
                </div>
              </div>
              <Button asChild className="w-full bg-she-indigo hover:bg-she-purple text-white">
                <Link to="/safety">Manage Safety</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resources Card (New) */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-she-dark flex items-center gap-2">
                <BookOpen className="text-she-blue" size={20} />
                Resources
              </CardTitle>
              <CardDescription>Health & safety information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <p className="text-gray-600">Explore our resources:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-she-pink/10 rounded-lg">
                    <p className="text-sm font-medium text-she-pink">Health Tips</p>
                  </div>
                  <div className="p-2 bg-she-indigo/10 rounded-lg">
                    <p className="text-sm font-medium text-she-indigo">Safety Tips</p>
                  </div>
                  <div className="p-2 bg-she-purple/10 rounded-lg">
                    <p className="text-sm font-medium text-she-purple">Wellness</p>
                  </div>
                  <div className="p-2 bg-she-blue/10 rounded-lg">
                    <p className="text-sm font-medium text-she-blue">Mental Health</p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-she-blue hover:bg-she-indigo text-white">
                <Link to="/resources">Explore Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-she-dark mb-6">Recent Activity</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`h-10 w-10 ${item.color} rounded-full flex items-center justify-center text-lg`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-she-dark">{item.activity}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cycle Input Form for Users without period data */}
      <PreviousCycleForm 
        open={showCycleForm} 
        onOpenChange={setShowCycleForm}
        onComplete={handleCycleFormComplete} 
      />
    </AppLayout>
  );
};

export default Dashboard;
