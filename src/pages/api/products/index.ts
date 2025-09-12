
import Product, { IProduct } from '@/models/Product';
import connectDB from '@/lib/db';

// API handler for products
export async function handleProductsRequest(req: { 
  method: string; 
  body?: any; 
  query?: { category?: string; featured?: string };
}) {
  // Connect to MongoDB
  await connectDB();
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        const { category, featured } = req.query || {};
        
        // Build query based on parameters
        const query: any = {};
        if (category) {
          query.category = category;
        }
        if (featured === 'true') {
          query.featured = true;
        }
        
        // Use as any to avoid TypeScript union type error
        const products = await (Product as any).find(query).sort({ name: 1 });
        
        // Convert to plain objects
        const plainProducts = products.map((product: any) => product.toObject ? product.toObject() : product);
        
        return { status: 200, data: plainProducts };
      } catch (error) {
        console.error('Error fetching products:', error);
        return { status: 500, data: { error: 'Failed to fetch products' } };
      }
      
    case 'POST':
      try {
        const data = req.body;
        
        // Create a product using new + save instead of create
        const productDoc = new Product(data);
        const product = await productDoc.save();
        
        return { status: 201, data: product.toObject ? product.toObject() : product };
      } catch (error) {
        console.error('Error creating product:', error);
        return { status: 500, data: { error: 'Failed to create product' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
