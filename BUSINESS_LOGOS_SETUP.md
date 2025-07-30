# Business Logo Setup Guide

This guide explains how to add business-specific logos to the application.

## How it works

The application now supports dynamic logos and business names that change based on the selected business. The system consists of:

1. **Business Configuration** (`src/config.ts`) - Centralized business configuration with logos, names, and display names
2. **Logo imports** (`src/utils/getBusinessLogo.ts`) - Imports actual logo files and provides utility functions
3. **Header component** (`src/components/Header.tsx`) - Uses the business context to display the correct logo and name

## Adding a new business logo

### Step 1: Add your logo file
Place your logo file in `src/assets/img/` directory. Supported formats: PNG, JPG, SVG, WebP.

Example: `src/assets/img/my-business-logo.png`

### Step 2: Update the business configuration
In `src/config.ts`, add your business to the `BUSINESS_CONFIG` object:

```typescript
export const BUSINESS_CONFIG = {
  RD: {
    logo: '/src/assets/img/rex-logo.png',
    name: "Rex's Diner",
    alt: "Rex Diner logo",
    displayName: "Rex's Diner"
  },
  // Add your new business here
  'MYBUSINESS': {
    logo: '/src/assets/img/my-business-logo.png',
    name: "My Business Name",
    alt: "My Business logo",
    displayName: "My Business Display Name"
  }
} as const;
```

### Step 3: Import the logo file
In `src/utils/getBusinessLogo.ts`, add the import and mapping:

```typescript
// Logo imports - add more logos as needed
import rexLogo from '../assets/img/rex-logo.png';
import myBusinessLogo from '../assets/img/my-business-logo.png'; // Add this line

// Logo mapping with actual imported logos
const LOGO_IMPORTS = {
  RD: rexLogo,
  MYBUSINESS: myBusinessLogo, // Add this line
} as const;
```

### Step 4: Test the implementation
1. Make sure your business is available in the business selector
2. Switch to your business in the application
3. Verify that the correct logo and business name appear in the header

## Example: Adding "Pizza Palace" business

```typescript
// In src/config.ts
export const BUSINESS_CONFIG = {
  RD: {
    logo: '/src/assets/img/rex-logo.png',
    name: "Rex's Diner",
    alt: "Rex Diner logo",
    displayName: "Rex's Diner"
  },
  'PIZZA': {
    logo: '/src/assets/img/pizza-palace-logo.png',
    name: "Pizza Palace",
    alt: "Pizza Palace logo",
    displayName: "Pizza Palace"
  }
} as const;
```

```typescript
// In src/utils/getBusinessLogo.ts
import rexLogo from '../assets/img/rex-logo.png';
import pizzaPalaceLogo from '../assets/img/pizza-palace-logo.png';

const LOGO_IMPORTS = {
  RD: rexLogo,
  PIZZA: pizzaPalaceLogo,
} as const;
```

## Notes

- The logo will automatically update when users switch between businesses
- If a business doesn't have a specific logo, it will fall back to the default Rex Diner logo
- Business names are handled with multiple fallback levels:
  1. **API data** - Uses the name from the business API response
  2. **Logo configuration** - Uses the name from the logo configuration
  3. **Predefined fallbacks** - Uses predefined business names for common IDs
  4. **Business ID** - Uses the business ID as the name
  5. **Default name** - Falls back to "Rex's Diner"
- Make sure your logo files are optimized for web use (reasonable file size)
- The system supports all common image formats (PNG, JPG, SVG, WebP)

## Business Name Fallback System

The application now includes a robust fallback system for business names:

### Priority Order:
1. **API Business Data** - Real business names from the server
2. **Business Configuration** - Display names defined in `BUSINESS_CONFIG`
3. **Business ID** - Uses the business ID as display name
4. **Default Name** - "Rex's Diner" as final fallback

### Adding Business Names:
In `src/config.ts`, add business names to the `BUSINESS_CONFIG` object:

```typescript
export const BUSINESS_CONFIG = {
  RD: {
    logo: '/src/assets/img/rex-logo.png',
    name: "Rex's Diner",
    alt: "Rex Diner logo",
    displayName: "Rex's Diner"
  },
  'NEW_BUSINESS': {
    logo: '/src/assets/img/new-business-logo.png',
    name: "New Business",
    alt: "New Business logo",
    displayName: "New Business Display Name"
  }
} as const;
``` 