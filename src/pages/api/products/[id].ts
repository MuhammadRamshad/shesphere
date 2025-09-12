
import Product from '@/models/Product';
import connectDB from '@/lib/db';

// API handler for single product
export async function handleProductRequest(req: { 
  method: string; 
  body?: any; 
  params: { id: string };
}) {
  // Connect to MongoDB
  await connectDB();
  
  const { id } = req.params;
  
  if (!id) {
    return { status: 400, data: { error: 'Product ID is required' } };
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        // Cast the model to any to avoid TypeScript errors
        const product = await (Product as any).findById(id);
        
        if (!product) {
          return { status: 404, data: { error: 'Product not found' } };
        }
        
        return { status: 200, data: product.toObject() };
      } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return { status: 500, data: { error: 'Failed to fetch product' } };
      }
      
    case 'PUT':
      try {
        const data = req.body;
        
        // Cast the model to any to avoid TypeScript errors
        const product = await (Product as any).findByIdAndUpdate(
          id, 
          data, 
          { new: true }
        );
        
        if (!product) {
          return { status: 404, data: { error: 'Product not found' } };
        }
        
        return { status: 200, data: product.toObject() };
      } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return { status: 500, data: { error: 'Failed to update product' } };
      }
      
    case 'DELETE':
      try {
        // Cast the model to any to avoid TypeScript errors
        const product = await (Product as any).findByIdAndDelete(id);
        
        if (!product) {
          return { status: 404, data: { error: 'Product not found' } };
        }
        
        return { status: 200, data: { message: 'Product deleted successfully' } };
      } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return { status: 500, data: { error: 'Failed to delete product' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
