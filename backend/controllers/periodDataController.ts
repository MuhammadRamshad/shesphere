
import { Request, Response } from 'express';
import { PeriodData } from '../models';

// Get period data for a user
export const getUserPeriodData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const periodData = await PeriodData.find({ userId }).sort({ date: -1 }).limit(30);
    
    res.status(200).json(periodData);
  } catch (error) {
    console.error('Error fetching period data:', error);
    res.status(500).json({ error: 'Failed to fetch period data' });
  }
};

// Save period data
export const savePeriodData = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    if (!data.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if an entry already exists for this date
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(data.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingEntry = await PeriodData.findOne({
      userId: data.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    let periodData;
    
    if (existingEntry) {
      // Update existing entry
      periodData = await PeriodData.findByIdAndUpdate(
        existingEntry._id,
        data,
        { new: true }
      );
    } else {
      // Create new entry
      periodData = new PeriodData(data);
      await periodData.save();
    }
    
    res.status(201).json(periodData);
  } catch (error) {
    console.error('Error saving period data:', error);
    res.status(500).json({ error: 'Failed to save period data' });
  }
};
