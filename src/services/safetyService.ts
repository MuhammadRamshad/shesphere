
import api from './api';
import { ISafetyContact, ISafetyAlert } from '@/types';

// Get all safety contacts for a user
export const getSafetyContacts = async (userId: string): Promise<ISafetyContact[]> => {
  try {
    const response = await api.get('/safety/contacts', { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching safety contacts:', error);
    
    // Fallback to localstorage if server is unavailable
    // Make sure we're only retrieving contacts for this specific user
    const storedContacts = localStorage.getItem('safetyContacts');
    if (storedContacts) {
      const contacts = JSON.parse(storedContacts);
      // Filter to only return contacts belonging to the requesting user
      return contacts.filter((contact: ISafetyContact) => contact.userId === userId);
    }
    
    return [];
  }
};

// Create a new safety contact
export const createSafetyContact = async (contact: Omit<ISafetyContact, '_id'>): Promise<ISafetyContact> => {
  try {
    const response = await api.post('/safety/contacts', contact);
    return response.data;
  } catch (error) {
    console.error('Error creating safety contact:', error);
    
    // Fallback to client-side storage
    const newContact = {
      ...contact,
      _id: `contact_${Date.now()}`,
    } as ISafetyContact;
    
    const storedContacts = localStorage.getItem('safetyContacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    contacts.push(newContact);
    localStorage.setItem('safetyContacts', JSON.stringify(contacts));
    
    return newContact;
  }
};

// Delete a safety contact
export const deleteSafetyContact = async (contactId: string, userId: string): Promise<void> => {
  try {
    await api.delete(`/safety/contacts/${contactId}`);
  } catch (error) {
    console.error('Error deleting safety contact:', error);
    
    // Fallback to client-side storage
    const storedContacts = localStorage.getItem('safetyContacts');
    if (storedContacts) {
      const contacts = JSON.parse(storedContacts);
      // Only remove contacts that belong to this user
      const updatedContacts = contacts.filter(
        (c: ISafetyContact) => !(c._id === contactId && c.userId === userId)
      );
      localStorage.setItem('safetyContacts', JSON.stringify(updatedContacts));
    }
  }
};

// Create a new safety alert
export const createSafetyAlert = async (
  alert: Omit<ISafetyAlert, '_id'>,
  sendSMS: boolean = true,
  sendEmail: boolean = true 
): Promise<ISafetyAlert> => {
  try {
    const alertWithFormattedLocation = { ...alert };

    const response = await api.post('/safety/alerts', {
      alert: alertWithFormattedLocation,
      sendSMS,
      sendEmail
    });

    return response.data;
  } catch (error) {
    console.error('Error creating safety alert:', error);

    const newAlert = {
      ...alert,
      _id: `alert_${Date.now()}`,
    } as ISafetyAlert;

    const storedAlerts = localStorage.getItem('safetyAlerts');
    const alerts = storedAlerts ? JSON.parse(storedAlerts) : [];
    alerts.push(newAlert);
    localStorage.setItem('safetyAlerts', JSON.stringify(alerts));

    return newAlert;
  }
};


// Get all safety alerts for a user
export const getSafetyAlerts = async (userId: string): Promise<ISafetyAlert[]> => {
  try {
    const response = await api.get('/safety/alerts', { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    
    // Fallback to localstorage if server is unavailable
    // Make sure to only return alerts specific to this user
    const storedAlerts = localStorage.getItem('safetyAlerts');
    if (storedAlerts) {
      const alerts = JSON.parse(storedAlerts);
      // Filter to only return alerts belonging to the requesting user
      return alerts.filter((alert: ISafetyAlert) => alert.userId === userId);
    }
    
    return [];
  }
};
