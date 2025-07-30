import axios from 'axios';
import { API_BASE_URL, DEFAULT_BUSINESS_ID } from '../config';

export interface Business {
  id: string;
  name: string;
  active: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication headers
apiClient.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Add user info to headers if available
        if (user.id && config.headers) {
          config.headers['X-User-ID'] = user.id.toString();
        }
        if (user.businessId && config.headers) {
          config.headers['X-Business-ID'] = user.businessId;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      console.error('Access denied - user may not have permission for this business');
    }
    return Promise.reject(error);
  }
);

// Fetch available businesses from the API
export const fetchBusinesses = async (): Promise<Business[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Business[]>>('/businesses');
    
    if (data.status === "success" && data.data) {
      return data.data.filter(business => business.active);
    } else {
      console.warn('Failed to fetch businesses:', data.message);
      return [{ id: DEFAULT_BUSINESS_ID, name: "Rex Diner", active: true }];
    }
  } catch (error) {
    console.error('Error fetching businesses:', error);
    // Return default business if API fails
    return [{ id: DEFAULT_BUSINESS_ID, name: "Rex Diner", active: true }];
  }
};

// Get current business from localStorage or use default
export const getCurrentBusiness = (): string => {
  return localStorage.getItem("currentBusiness") || DEFAULT_BUSINESS_ID;
};

// Set current business in localStorage
export const setCurrentBusiness = (businessId: string): void => {
  localStorage.setItem("currentBusiness", businessId);
};

// Create API URL with business parameter
export const createBusinessApiUrl = (endpoint: string, businessId?: string): string => {
  const currentBusiness = businessId || getCurrentBusiness();
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${API_BASE_URL}${endpoint}${separator}business=${currentBusiness}`;
};

// Generic API call function with business context
export const apiCall = async <T>(
  endpoint: string, 
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    businessId?: string;
  } = {}
): Promise<T> => {
  const { method = 'GET', data, businessId } = options;
  const url = createBusinessApiUrl(endpoint, businessId);
  
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
    });
    
    return response.data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Export the apiClient for direct use if needed
export { apiClient }; 