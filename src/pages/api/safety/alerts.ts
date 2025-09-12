
import SafetyAlert, { ISafetyAlert } from '@/models/SafetyAlert';
import connectDB from '@/lib/db';

// API handler for safety alerts
export async function handleSafetyAlertsRequest(req: { 
  method: string; 
  body?: any; 
  query?: { userId?: string };
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
        
        // Cast the model to any to avoid TypeScript errors
        const alerts = await (SafetyAlert as any).find({ userId }).sort({ timestamp: -1 });
        
        // Convert to plain objects
        const plainAlerts = alerts.map(alert => alert.toObject());
        
        return { status: 200, data: plainAlerts };
      } catch (error) {
        console.error('Error fetching safety alerts:', error);
        return { status: 500, data: { error: 'Failed to fetch safety alerts' } };
      }
      
    case 'POST':
      try {
        const { alert, sendSMS = false } = req.body;
        
        if (!alert.userId) {
          return { status: 400, data: { error: 'User ID is required' } };
        }
        
        // Transform location data if it exists in lat/lng format
        if (alert.location) {
          // Check if we have lat/lng instead of latitude/longitude
          if (alert.location.lat !== undefined && alert.location.lng !== undefined) {
            // Transform to the schema expected format
            alert.location = {
              latitude: alert.location.lat,
              longitude: alert.location.lng,
              address: alert.location.address
            };
          }
        }
        
        console.log('Creating alert with data:', JSON.stringify(alert, null, 2));
        
        // Create a safety alert using new + save instead of create
        const alertDoc = new SafetyAlert(alert);
        const newAlert = await alertDoc.save();
        
        // In a real app, you would send SMS notifications here
        if (sendSMS) {
          console.log('SMS notifications would be sent to contacts:', alert.contactsNotified);
        }
        
        return { status: 201, data: newAlert.toObject() };
      } catch (error) {
        console.error('Error creating safety alert:', error);
        return { status: 500, data: { error: 'Failed to create safety alert' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
