import mongoose from 'mongoose'
import { getEnv } from './env-validation'

const env = getEnv()
const MONGODB_URI: string = env.MONGODB_URI

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

/**
 * Exponential backoff retry mechanism for MongoDB connection
 */
async function connectWithRetry(
  uri: string,
  options: mongoose.ConnectOptions,
  maxRetries = 5,
  initialDelay = 1000
): Promise<typeof mongoose> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await mongoose.connect(uri, options)
      console.log(`✅ MongoDB connected successfully (attempt ${attempt}/${maxRetries})`)
      return connection
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }

      const delay = initialDelay * Math.pow(2, attempt - 1)
      const jitter = Math.random() * 1000
      const totalDelay = delay + jitter

      console.warn(
        `⚠️  MongoDB connection attempt ${attempt}/${maxRetries} failed. Retrying in ${Math.round(totalDelay)}ms...`,
        error instanceof Error ? error.message : 'Unknown error'
      )

      await new Promise(resolve => setTimeout(resolve, totalDelay))
    }
  }

  throw new Error(
    `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  )
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Use IPv4, skip IPv6
    }

    cached.promise = connectWithRetry(MONGODB_URI, opts) as any
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ MongoDB connection failed:', e)
    throw e
  }

  return cached.conn
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})

export default connectDB
