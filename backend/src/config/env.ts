import { z } from 'zod';

/**
 * Environment Configuration Schema
 * Validates all required environment variables at startup
 * Fails fast with actionable errors if configuration is missing or invalid
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Configuration
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .describe('Secret key for signing access tokens'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
    .describe('Secret key for signing refresh tokens'),
  JWT_ACCESS_EXPIRY: z.string().default('15m').describe('Access token expiration (e.g., 15m, 1h)'),
  JWT_REFRESH_EXPIRY: z.string().default('7d').describe('Refresh token expiration (e.g., 7d, 30d)'),

  // CORS Configuration
  CORS_ORIGINS: z
    .string()
    .describe('Comma-separated list of allowed origins (e.g., http://localhost:5173,https://app.example.com)')
    .transform((val) => val.split(',').map((origin) => origin.trim())),

  // Trusted IPs (for rate limit bypass)
  TRUSTED_IPS: z
    .string()
    .optional()
    .default('')
    .transform((val) => (val ? val.split(',').map((ip) => ip.trim()) : [])),

  // Cloudflare R2 / S3 Media Storage
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required for media uploads'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_MEDIA_BUCKET: z.string().min(1, 'R2_MEDIA_BUCKET is required'),
  R2_MEDIA_PUBLIC_HOST: z.string().url('R2_MEDIA_PUBLIC_HOST must be a valid URL'),

  // SendGrid (Optional - for password reset emails)
  SENDGRID_API_KEY: z.string().optional().describe('Required for password reset and notifications'),
  SENDGRID_FROM_EMAIL: z.string().email().optional().default('noreply@example.com'),

  // Stripe (Optional - for reservations)
  STRIPE_SECRET_KEY: z.string().optional().describe('Required for payment processing'),
  STRIPE_WEBHOOK_SECRET: z.string().optional().describe('Required for webhook signature verification'),

  // Google Analytics
  VITE_GA_MEASUREMENT_ID: z.string().optional().describe('Google Analytics 4 measurement ID'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Export type for use in application
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment configuration and exits if invalid
 * Call this at application startup before initializing any services
 */
export function validateEnv(): void {
  try {
    envSchema.parse(process.env);
    console.log(' Environment configuration validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('L Environment configuration validation failed:');
      console.error('');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('');
      console.error('Please check your .env file and ensure all required variables are set.');
      console.error('');
      process.exit(1);
    }
    throw error;
  }
}

// Helpful type guard for checking if optional variables are set
export const isEmailConfigured = (): boolean => {
  return Boolean(env.SENDGRID_API_KEY);
};

export const isStripeConfigured = (): boolean => {
  return Boolean(env.STRIPE_SECRET_KEY);
};
