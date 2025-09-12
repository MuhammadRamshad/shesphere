
import api from './api';
import { IPeriodData } from '@/types';

// Get period data for a user
export const getPeriodData = async (userId: string): Promise<IPeriodData[]> => {
  try {
    const response = await api.get('/period-data', { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching period data:', error);
    
    // Fallback to localStorage if API fails
    // Make sure we only retrieve data for this specific user
    const storedData = localStorage.getItem('periodData');
    if (storedData) {
      const data = JSON.parse(storedData);
      return data.filter((entry: IPeriodData) => entry.userId === userId);
    }
    
    return [];
  }
};

// Save period data
export const savePeriodData = async (data: {
  userId: string;
  date: Date;
  periodStart: boolean;
  periodEnd?: boolean;
  symptoms: string[];
  flow: 'light' | 'medium' | 'heavy' | null;
  mood: string[];
  notes: string;
  temperature?: number;
  medications?: string[];
  spotting?: boolean;
  intercourse?: boolean;
}): Promise<IPeriodData> => {
  try {
    const response = await api.post('/period-data', data);
    return response.data;
  } catch (error) {
    console.error('Error saving period data:', error);
    
    // Fallback to client-side storage
    const newEntry = {
      _id: `period_${Date.now()}`,
      ...data,
      // Map to match the interface requirements
      startDate: data.date, // Map date to startDate
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as IPeriodData; // Cast after adding required fields
    
    // Store in localStorage for offline persistence
    const storedData = localStorage.getItem('periodData');
    const periodData = storedData ? JSON.parse(storedData) : [];
    
    // Check if an entry for this date already exists for this specific user
    const dateStr = new Date(data.date).toDateString();
    const existingEntryIndex = periodData.findIndex((entry: any) => 
      entry.userId === data.userId && new Date(entry.date || entry.startDate).toDateString() === dateStr
    );
    
    if (existingEntryIndex !== -1) {
      // Update existing entry
      periodData[existingEntryIndex] = {
        ...periodData[existingEntryIndex],
        ...data,
        startDate: data.date, // Map date to startDate
        updatedAt: new Date()
      };
    } else {
      // Add new entry
      periodData.push(newEntry);
    }
    
    localStorage.setItem('periodData', JSON.stringify(periodData));
    
    return newEntry;
  }
};
