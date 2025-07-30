import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBusinesses, Business } from '../services/api';
import { DEFAULT_BUSINESS_ID } from '../config';

interface BusinessContextType {
  currentBusiness: string;
  setCurrentBusiness: (businessId: string) => void;
  businessOptions: Business[];
  isLoading: boolean;
  error: string | null;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBusiness, setCurrentBusiness] = useState(DEFAULT_BUSINESS_ID);
  const [businessOptions, setBusinessOptions] = useState<Business[]>([
    { id: DEFAULT_BUSINESS_ID, name: "Rex Diner", active: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load business from localStorage
  useEffect(() => {
    const savedBusiness = localStorage.getItem("currentBusiness");
    if (savedBusiness) {
      setCurrentBusiness(savedBusiness);
    }
  }, []);

  // Fetch business options from API
  const loadBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const businesses = await fetchBusinesses();
      setBusinessOptions(businesses);
      
      // If current business is not in the list, set to first available
      const currentBusinessExists = businesses.some(b => b.id === currentBusiness);
      if (!currentBusinessExists && businesses.length > 0) {
        setCurrentBusiness(businesses[0].id);
        localStorage.setItem("currentBusiness", businesses[0].id);
      }
    } catch (err) {
      setError('Failed to load businesses');
      console.error('Error loading businesses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load businesses on mount
  useEffect(() => {
    loadBusinesses();
  }, []);

  // Save business to localStorage
  const handleSetBusiness = (businessId: string) => {
    setCurrentBusiness(businessId);
    localStorage.setItem("currentBusiness", businessId);
  };

  const refreshBusinesses = async () => {
    await loadBusinesses();
  };

  return (
    <BusinessContext.Provider value={{
      currentBusiness,
      setCurrentBusiness: handleSetBusiness,
      businessOptions,
      isLoading,
      error,
      refreshBusinesses
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}; 