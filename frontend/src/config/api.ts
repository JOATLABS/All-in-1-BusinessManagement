/**
 * API configuration for single-tenant frontend
 * No tenant context needed in URLs or headers
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};
