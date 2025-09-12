
import connectDB from '@/lib/db';
import Symptom, { ISymptom } from '@/models/Symptom';

// Ensure database connection before performing any operations
const ensureDBConnection = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn('Database connection issue:', error);
    // Continue with mock data in browser environment
  }
};

// Mock symptom data for client-side rendering
const mockSymptoms: ISymptom[] = [
  {
    _id: 'mock1',
    name: 'Cramps',
    category: 'physical',
    description: 'Abdominal or pelvic pain',
    icon: '😖'
  } as unknown as ISymptom,
  {
    _id: 'mock2',
    name: 'Headache',
    category: 'physical',
    description: 'Pain in the head or temples',
    icon: '🤕'
  } as unknown as ISymptom,
  {
    _id: 'mock3',
    name: 'Fatigue',
    category: 'physical',
    description: 'Feeling tired or exhausted',
    icon: '😴'
  } as unknown as ISymptom,
  {
    _id: 'mock4',
    name: 'Anxiety',
    category: 'emotional',
    description: 'Feeling worried or nervous',
    icon: '😰'
  } as unknown as ISymptom,
  {
    _id: 'mock5',
    name: 'Mood swings',
    category: 'emotional',
    description: 'Rapid changes in mood',
    icon: '🎭'
  } as unknown as ISymptom
];

export const getAllSymptoms = async (): Promise<ISymptom[]> => {
  try {
    await ensureDBConnection();
    
    // In browser environment, return mock data
    if (typeof window !== 'undefined') {
      console.log('Using mock symptoms data in browser');
      return mockSymptoms;
    }
    
    // Get all symptoms
    const symptoms = await Symptom.find({}).sort({ category: 1, name: 1 }).exec();
    
    return symptoms;
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return mockSymptoms; // Fallback to mock data
  }
};

export const getSymptomsByCategory = async (category: 'physical' | 'emotional' | 'other'): Promise<ISymptom[]> => {
  try {
    await ensureDBConnection();
    
    // In browser environment, return filtered mock data
    if (typeof window !== 'undefined') {
      return mockSymptoms.filter(s => s.category === category);
    }
    
    // Get symptoms by category
    const symptoms = await Symptom.find({ category }).sort({ name: 1 }).exec();
    
    return symptoms;
  } catch (error) {
    console.error(`Error fetching ${category} symptoms:`, error);
    return mockSymptoms.filter(s => s.category === category);
  }
};

export const addSymptom = async (data: {
  name: string;
  category: 'physical' | 'emotional' | 'other';
  description?: string;
  icon?: string;
}): Promise<ISymptom> => {
  try {
    await ensureDBConnection();
    
    // In browser environment, mock adding symptom
    if (typeof window !== 'undefined') {
      console.log('Mock adding symptom in browser:', data);
      const existingSymptom = mockSymptoms.find(s => s.name === data.name);
      
      if (existingSymptom) {
        return existingSymptom;
      }
      
      const newSymptom = {
        _id: `mock${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as ISymptom;
      
      mockSymptoms.push(newSymptom);
      return newSymptom;
    }
    
    // Check if symptom already exists
    const existingSymptom = await Symptom.findOne({ name: data.name }).exec();
    
    if (existingSymptom) {
      return existingSymptom;
    }
    
    // Create new symptom
    const newSymptom = await Symptom.create(data);
    return newSymptom;
  } catch (error) {
    console.error('Error adding symptom:', error);
    // Return a mock entry in case of error
    return {
      _id: `mock${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as ISymptom;
  }
};
