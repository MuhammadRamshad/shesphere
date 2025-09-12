
import Resource, { IResource } from '@/models/Resource';
import connectDB from '@/lib/db';

// API handler for resources
export async function handleResourcesRequest(req: { 
  method: string; 
  body?: any; 
  query?: { category?: string }
}) {
  // Connect to MongoDB
  await connectDB();
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        const category = req.query?.category;
        
        let resources;
        if (category) {
          resources = await Resource.find({ category }).sort({ title: 1 });
        } else {
          resources = await Resource.find().sort({ category: 1, title: 1 });
        }
        
        // Convert to plain objects
        return { status: 200, data: resources.map(resource => resource.toObject()) };
      } catch (error) {
        console.error('Error fetching resources:', error);
        return { status: 500, data: { error: 'Failed to fetch resources' } };
      }
      
    case 'POST':
      try {
        const data = req.body;
        
        // Create a resource using new + save instead of create
        const resourceDoc = new Resource(data);
        const resource = await resourceDoc.save();
        
        return { status: 201, data: resource.toObject() };
      } catch (error) {
        console.error('Error creating resource:', error);
        return { status: 500, data: { error: 'Failed to create resource' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
