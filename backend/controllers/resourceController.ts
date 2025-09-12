
import { Request, Response } from 'express';
import { Resource } from '../models';

// Get all resources
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let resources;
    if (category) {
      resources = await Resource.find({ category }).sort({ title: 1 });
    } else {
      resources = await Resource.find().sort({ category: 1, title: 1 });
    }
    
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// Create a new resource
export const createResource = async (req: Request, res: Response) => {
  try {
    const resourceData = req.body;
    
    const resource = new Resource(resourceData);
    await resource.save();
    
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

// Get resource by ID
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json(resource);
  } catch (error) {
    console.error(`Error fetching resource ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
};
