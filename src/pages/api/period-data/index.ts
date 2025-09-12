
import PeriodData, { IPeriodData } from '@/models/PeriodData';
import connectDB from '@/lib/db';
import { savePeriodData, getPeriodData } from '@/services/periodService';

// API handler for period data
export async function handlePeriodDataRequest(req: { 
  method: string; 
  body?: any; 
  query?: { userId?: string }
}) {
  // Connect to MongoDB
  await connectDB();
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        const userId = req.query?.userId as string;
        
        if (!userId) {
          return { status: 400, data: { error: 'User ID is required' } };
        }
        
        const periodData = await getPeriodData(userId);
        return { status: 200, data: periodData };
      } catch (error) {
        console.error('Error fetching period data:', error);
        return { status: 500, data: { error: 'Failed to fetch period data' } };
      }
      
    case 'POST':
      try {
        const data = req.body;
        
        if (!data.userId) {
          return { status: 400, data: { error: 'User ID is required' } };
        }
        
        const savedData = await savePeriodData(data);
        return { status: 201, data: savedData };
      } catch (error) {
        console.error('Error saving period data:', error);
        return { status: 500, data: { error: 'Failed to save period data' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
