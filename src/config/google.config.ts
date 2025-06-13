import { config } from './app.config';

/**
 * Google OAuth configuration
 */
export const googleConfig = {
  // Client ID from Google Cloud Console
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  
  // Client Secret from Google Cloud Console
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Callback URL for Google OAuth
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${config.baseUrl}/api/auth/google/callback`,
  
  // Required scopes for Google OAuth
  scopes: [
    'profile',
    'email'
  ],
  
  // OAuth 2.0 settings
  accessType: 'offline' as const,
  prompt: 'consent' as const,
  
  // Frontend callback URL after OAuth process
  frontendCallbackUrl: `${config.frontendUrl}/auth/google/callback`,
  
  // Validate configuration
  validate() {
    if (!this.clientId) {
      throw new Error('GOOGLE_CLIENT_ID is required');
    }
    
    if (!this.clientSecret) {
      throw new Error('GOOGLE_CLIENT_SECRET is required');
    }
    
    return this;
  }
};

// Export validated config
export default googleConfig.validate();