
import SafetyContact, { ISafetyContact } from '@/models/SafetyContact';
import connectDB from '@/lib/db';

// API handler for safety contacts
export async function handleSafetyContactsRequest(req: { 
  method: string; 
  body?: any; 
  query?: { userId?: string };
  params?: { id?: string };
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
        const contacts = await (SafetyContact as any).find({ userId });
        
        // Convert to plain objects
        const plainContacts = contacts.map(contact => contact.toObject());
        
        return { status: 200, data: plainContacts };
      } catch (error) {
        console.error('Error fetching safety contacts:', error);
        return { status: 500, data: { error: 'Failed to fetch safety contacts' } };
      }
      
    case 'POST':
      try {
        const data = req.body;
        
        if (!data.userId) {
          return { status: 400, data: { error: 'User ID is required' } };
        }
        
        // Create a safety contact using new + save instead of create
        const contactDoc = new SafetyContact(data);
        const contact = await contactDoc.save();
        
        return { status: 201, data: contact.toObject() };
      } catch (error) {
        console.error('Error creating safety contact:', error);
        return { status: 500, data: { error: 'Failed to create safety contact' } };
      }
      
    case 'DELETE':
      try {
        const id = req.params?.id;
        
        if (!id) {
          return { status: 400, data: { error: 'Contact ID is required' } };
        }
        
        // Cast the model to any to avoid TypeScript errors
        const result = await (SafetyContact as any).findByIdAndDelete(id);
        
        if (!result) {
          return { status: 404, data: { error: 'Contact not found' } };
        }
        
        return { status: 200, data: { message: 'Contact deleted successfully' } };
      } catch (error) {
        console.error('Error deleting safety contact:', error);
        return { status: 500, data: { error: 'Failed to delete safety contact' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
