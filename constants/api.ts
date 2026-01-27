/**
 * API Configuration
 * Centralized base URL for development and production environments.
 */
const __DEV__ = true;

// LOCAL: Update this with your machine's local IP if testing on a real device
const DEV_API_URL = 'http://192.168.1.9:5000';

// PRODUCTION: The Vercel deployment URL
const PROD_API_URL = 'https://filter-server.vercel.app';

// Export the URL based on the development environment flag
// __DEV__ is a global variable provided by React Native
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export default {
    API_BASE_URL,
    endpoints: {
        register: '/api/register',
        login: '/api/login',
        providers: '/api/providers',
        // Add more specific endpoints here if needed
    }
};
