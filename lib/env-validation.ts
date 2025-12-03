// Environment Variable Validation with Zod
import { z } from 'zod'

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URL').optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  
  // Email Service (Brevo)
  BREVO_API_KEY: z.string().min(1, 'BREVO_API_KEY is required').optional(),
  BREVO_FROM_EMAIL: z.string().email('BREVO_FROM_EMAIL must be a valid email').optional(),
  BREVO_FROM_NAME: z.string().optional(),
  
  // AI Service (Groq)
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required').optional(),
  
  // Optional: Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Next.js (automatically set)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env

export function validateEnv(): Env {
  if (env) {
    return env
  }

  try {
    env = envSchema.parse({
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      BREVO_API_KEY: process.env.BREVO_API_KEY,
      BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
      BREVO_FROM_NAME: process.env.BREVO_FROM_NAME,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully')
    }

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.')
        return `  ❌ ${path}: ${err.message}`
      }).join('\n')

      console.error('❌ Environment validation failed:\n' + errors)
      
      throw new Error(
        'Invalid environment variables. Please check your .env.local file.\n' + errors
      )
    }
    throw error
  }
}

// Export validated env for type-safe access
export function getEnv(): Env {
  if (!env) {
    return validateEnv()
  }
  return env
}

// Validate on module load (but only on server-side and not during build)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    validateEnv()
  } catch (error) {
    // Only warn during development, don't fail the build
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Environment validation warning:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
