import { BUSINESS_CONFIG, DEFAULT_BUSINESS_CONFIG } from '../config';
import rexLogo from '../assets/img/rex-logo.png';
// Example: import business2Logo from '../assets/img/business2-logo.png';

export interface BusinessLogo {
  logo: string;
  name: string;
  alt: string;
  displayName: string;
}

// Logo mapping with actual imported logos
const LOGO_IMPORTS = {
  RD: rexLogo,
  // BM: no logo needed - will be handled by empty string
  // Add more business logos here as needed
  // Example: BUSINESS2: business2Logo,
} as const;

export const getBusinessLogo = (businessId: string): BusinessLogo => {
  // Check if we have a specific configuration for this business
  const businessConfig = BUSINESS_CONFIG[businessId as keyof typeof BUSINESS_CONFIG];
  const logoImport = LOGO_IMPORTS[businessId as keyof typeof LOGO_IMPORTS];
  
  if (businessConfig) {
    // If business has an empty logo string, use it (no logo)
    if (businessConfig.logo === '') {
      return {
        ...businessConfig,
        logo: '' // Empty string for no logo
      };
    }
    
    // If business has a logo import, use it
    if (logoImport) {
      return {
        ...businessConfig,
        logo: logoImport
      };
    }
    
    // If business has a logo path but no import, use the path
    if (businessConfig.logo) {
      return businessConfig;
    }
  }
  
  // Return default configuration for unknown businesses
  return {
    ...DEFAULT_BUSINESS_CONFIG,
    logo: rexLogo
  };
};

// Helper function to get business name with fallback
export const getBusinessName = (businessId: string, businessOptions: any[] = []): string => {
  // For specific businesses, prioritize configuration over API data
  const businessConfig = BUSINESS_CONFIG[businessId as keyof typeof BUSINESS_CONFIG];
  if (businessConfig?.displayName) {
    return businessConfig.displayName;
  }
  
  // Fallback to API data
  const businessData = businessOptions.find(b => b.id === businessId);
  if (businessData?.name) {
    return businessData.name;
  }
  
  // Final fallback - use business ID as name
  return businessId || DEFAULT_BUSINESS_CONFIG.displayName;
}; 