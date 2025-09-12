
import api from './api';
import { IResource } from '@/types';

// Mock resources data for client-side development
const mockResources = [
  {
    _id: "1",
    title: "Reproductive Health Basics",
    description: "Learn essential information about reproductive health",
    category: "health",
    type: "video",
    url: "https://example.com/reproductive-health",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    _id: "2",
    title: "Self-Defense Techniques",
    description: "Basic self-defense moves every woman should know",
    category: "safety",
    type: "video",
    url: "https://example.com/self-defense",
    videoUrl: "https://www.youtube.com/embed/KVpxP3ZZtAc",
    thumbnailUrl: "https://img.youtube.com/vi/KVpxP3ZZtAc/hqdefault.jpg",
  },
  {
    _id: "3",
    title: "Meditation for Beginners",
    description: "Simple meditation techniques for daily practice",
    category: "wellness",
    type: "video",
    url: "https://example.com/meditation",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
    thumbnailUrl: "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg",
  },
  {
    _id: "4",
    title: "Understanding Anxiety",
    description: "How to recognize and manage anxiety symptoms",
    category: "mental",
    type: "video",
    url: "https://example.com/anxiety",
    videoUrl: "https://www.youtube.com/embed/WWloIAQpMcQ",
    thumbnailUrl: "https://img.youtube.com/vi/WWloIAQpMcQ/hqdefault.jpg",
  },
  {
    _id: "5",
    title: "Nutrition for Women's Health",
    description: "Essential nutrients for women's health needs",
    category: "health",
    type: "video",
    url: "https://example.com/nutrition",
    videoUrl: "https://www.youtube.com/embed/yAXa9SH1Npc",
    thumbnailUrl: "https://img.youtube.com/vi/yAXa9SH1Npc/hqdefault.jpg",
  },
  {
    _id: "6",
    title: "Personal Safety Planning",
    description: "How to create a personal safety plan",
    category: "safety",
    type: "video",
    url: "https://example.com/safety-planning",
    videoUrl: "https://www.youtube.com/embed/9Z8MzPDug8U",
    thumbnailUrl: "https://img.youtube.com/vi/9Z8MzPDug8U/hqdefault.jpg",
  },
  {
    _id: "7",
    title: "Yoga for Stress Relief",
    description: "Gentle yoga poses to reduce stress",
    category: "wellness",
    type: "video",
    url: "https://example.com/yoga",
    videoUrl: "https://www.youtube.com/embed/hJbRpHZr_d0",
    thumbnailUrl: "https://img.youtube.com/vi/hJbRpHZr_d0/hqdefault.jpg",
  },
  {
    _id: "8",
    title: "Mental Health Stigma",
    description: "Breaking down mental health stigma",
    category: "mental",
    type: "video",
    url: "https://example.com/mental-health",
    videoUrl: "https://www.youtube.com/embed/49mfPFTZsHs",
    thumbnailUrl: "https://img.youtube.com/vi/49mfPFTZsHs/hqdefault.jpg",
  }
];

// Get all resources
export const getAllResources = async (): Promise<IResource[]> => {
  try {
    const response = await api.get('/resources');
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    // Add the url property required by IResource to make the mock data compatible
    const resourcesWithUrl = mockResources.map(r => ({
      ...r, 
      url: r.videoUrl || '' 
    })) as unknown as IResource[];
    return resourcesWithUrl;
  }
};

// Get resources by category
export const getResourcesByCategory = async (category: string): Promise<IResource[]> => {
  try {
    const response = await api.get('/resources', { params: { category } });
    return response.data;
  } catch (error) {
    console.error('Error fetching resources by category:', error);
    // Add the url property and filter by category
    const filteredResources = mockResources.filter(r => {
      // Handle both string and array comparisons by checking the type first
      if (typeof r.category === 'string') {
        return r.category === category;
      } else if (Array.isArray(r.category)) {
        return (r.category as string[]).includes(category);
      }
      return false;
    }).map(r => ({
      ...r, 
      url: r.videoUrl || '' 
    })) as unknown as IResource[];
    
    return filteredResources;
  }
};

// Add resource to the database
export const addResource = async (data: Partial<IResource>): Promise<IResource | null> => {
  try {
    const response = await api.post('/resources', data);
    return response.data;
  } catch (error) {
    console.error('Error adding resource:', error);
    return null;
  }
};

// Get resource by ID
export const getResourceById = async (id: string): Promise<IResource | null> => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
    const foundResource = mockResources.find(r => r._id === id);
    if (foundResource) {
      // Add the url property required by IResource
      return { ...foundResource, url: foundResource.videoUrl || '' } as unknown as IResource;
    }
    return null;
  }
};
