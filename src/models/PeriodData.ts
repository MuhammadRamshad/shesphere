
import mongoose, { Schema, Document } from 'mongoose';

export interface IPeriodData extends Document {
  userId: string;
  date: Date;
  periodStart: boolean;
  periodEnd: boolean;
  symptoms: string[];
  flow: 'light' | 'medium' | 'heavy' | null;
  mood: string[];
  notes: string;
  temperature?: number; // Basal body temperature
  medications?: string[];
  spotting?: boolean;
  intercourse?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PeriodDataSchema: Schema = new Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  periodStart: { type: Boolean, default: false },
  periodEnd: { type: Boolean, default: false },
  symptoms: [{ type: String }],
  flow: { type: String, enum: ['light', 'medium', 'heavy', null], default: null },
  mood: [{ type: String }],
  notes: { type: String, default: '' },
  temperature: { type: Number },
  medications: [{ type: String }],
  spotting: { type: Boolean },
  intercourse: { type: Boolean }
}, { timestamps: true });

// Create a mock model for client-side or use the actual model for server-side
let PeriodData: any;

// Check if we're in the browser
if (typeof window !== 'undefined') {
  // Create a more robust mock model for client-side
  console.log('Using enhanced mock PeriodData model for client-side rendering');
  
  // In-memory store for client-side data
  const clientStore: Record<string, any[]> = {};
  
  PeriodData = {
    find: (query: any = {}) => {
      const results = Object.values(clientStore)
        .flat()
        .filter(item => {
          // Match all query criteria
          return Object.entries(query).every(([key, value]) => {
            if (key === 'userId') return item.userId === value;
            return true;
          });
        });
        
      return {
        sort: (sortCriteria: any) => {
          // Basic sorting implementation
          const sortField = Object.keys(sortCriteria)[0];
          const sortDirection = sortCriteria[sortField];
          
          const sorted = [...results].sort((a, b) => {
            if (sortDirection === -1) {
              return new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
            }
            return new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
          });
          
          return {
            limit: (n: number) => {
              const limited = sorted.slice(0, n);
              return {
                exec: () => limited
              };
            },
            exec: () => sorted
          };
        },
        exec: () => results
      };
    },
    findOne: (query: any = {}) => {
      const results = Object.values(clientStore)
        .flat()
        .find(item => {
          // Special handling for date range queries
          if (query.date && typeof query.date === 'object') {
            const itemDate = new Date(item.date);
            if (query.date.$gte && query.date.$lt) {
              return itemDate >= query.date.$gte && itemDate < query.date.$lt && item.userId === query.userId;
            }
          }
          
          // Match all other query criteria
          return Object.entries(query).every(([key, value]) => {
            if (key === 'userId') return item.userId === value;
            if (key === 'date' && typeof value === 'object') return true; // Skip complex date queries
            return item[key] === value;
          });
        });
      
      return {
        exec: () => results || null
      };
    },
    findByIdAndUpdate: (id: string, data: any, options: any = {}) => {
      // Find and update the item in client store
      for (const userId in clientStore) {
        const index = clientStore[userId].findIndex(item => item._id === id);
        if (index !== -1) {
          clientStore[userId][index] = {
            ...clientStore[userId][index],
            ...data,
            updatedAt: new Date()
          };
          
          return {
            exec: () => clientStore[userId][index]
          };
        }
      }
      
      return {
        exec: () => null
      };
    },
    create: (data: any) => {
      const newItem = {
        _id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Initialize user's store if it doesn't exist
      if (!clientStore[data.userId]) {
        clientStore[data.userId] = [];
      }
      
      // Add the new item
      clientStore[data.userId].push(newItem);
      
      return Promise.resolve(newItem);
    }
  };
} else {
  // Server-side: Use real Mongoose model
  try {
    // Check if the model is already defined
    PeriodData = mongoose.models.PeriodData || mongoose.model<IPeriodData>('PeriodData', PeriodDataSchema);
  } catch (error) {
    console.error('Error creating PeriodData model:', error);
    // Create a minimal fallback model
    PeriodData = {
      find: () => ({ sort: () => ({ limit: () => ({ exec: () => [] }) }), exec: () => [] }),
      findOne: () => ({ exec: () => null }),
      findByIdAndUpdate: () => ({ exec: () => null }),
      create: (data: any) => Promise.resolve(data)
    };
  }
}

export default PeriodData;
