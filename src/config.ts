// config.ts

// API Base URL - supports environment variables
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (window.location.hostname === "localhost"
    ? "http://localhost:7777/api/v1"
    : "https://rd.n9xo.xyz/api/v1");

// Default Business ID
export const DEFAULT_BUSINESS_ID = process.env.REACT_APP_DEFAULT_BUSINESS || "RD";

// Feature Flags
export const ENABLE_MULTI_BUSINESS = process.env.REACT_APP_ENABLE_MULTI_BUSINESS !== "false";
export const ENABLE_BUSINESS_SELECTOR = process.env.REACT_APP_ENABLE_BUSINESS_SELECTOR !== "false";

// Business Configuration
export const BUSINESS_CONFIG = {
  RD: {
    logo: '/src/assets/img/rex-logo.png',
    name: "Rex's Diner",
    alt: "Rex Diner logo",
    displayName: "Rex's Diner"
  },
  BM: {
    logo: '', // No logo for Beam Machine
    name: "Beam Machine",
    alt: "Beam Machine",
    displayName: "Beam Machine"
  },
  MPT: {
    logo: '', // No logo for Beam Machine
    name: "Mirror Park Tavern",
    alt: "Mirror Park Tavern",
    displayName: "Mirror Park Tavern"
  },
  // Add more businesses as needed
  // Example for a second business:
  // 'BUSINESS2': {
  //   logo: '/src/assets/img/business2-logo.png',
  //   name: "Business 2 Name",
  //   alt: "Business 2 logo",
  //   displayName: "Business 2 Display Name"
  // }
} as const;

// Default business configuration for unknown businesses
export const DEFAULT_BUSINESS_CONFIG = {
  logo: '/src/assets/img/rex-logo.png',
  name: "Rex's Diner",
  alt: "Rex Diner logo",
  displayName: "Rex's Diner"
}; 