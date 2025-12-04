// MongoDB Transactions and Atomic Operations
// Enterprise-grade data consistency with ACID transactions

import mongoose, { ClientSession, Model, Document } from 'mongoose'
import { logger } from '../middleware/request-logger'

export class TransactionManager {
  /**
   * Execute operations within a MongoDB transaction
   * Ensures ACID properties for critical operations
   */
  static async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options?: {
      maxRetries?: number
      retryDelay?: number
    }
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 100 } = options || {}
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const session = await mongoose.startSession()
      
      try {
        logger.debug('Starting transaction', { attempt, maxRetries })
        
        // Start transaction with default settings
        session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        })

        // Execute the operation
        const result = await operation(session)

        // Commit transaction
        await session.commitTransaction()
        logger.debug('Transaction committed successfully', { attempt })

        return result
      } catch (error) {
        lastError = error as Error
        
        // Abort transaction on error
        await session.abortTransaction()
        logger.error('Transaction failed', error, { attempt, maxRetries })

        // Check if error is transient and we should retry
        if (attempt < maxRetries && this.isTransientError(error)) {
          logger.info('Retrying transaction', { attempt, nextAttempt: attempt + 1 })
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          continue
        }

        throw error
      } finally {
        await session.endSession()
      }
    }

    throw lastError || new Error('Transaction failed after all retries')
  }

  /**
   * Check if error is transient and can be retried
   */
  private static isTransientError(error: any): boolean {
    if (!error) return false
    
    const transientErrors = [
      'TransientTransactionError',
      'UnknownTransactionCommitResult',
      'NetworkTimeout',
      'InterruptedDueToReplStateChange',
    ]

    return (
      transientErrors.some(code => error.message?.includes(code)) ||
      error.hasErrorLabel?.('TransientTransactionError') ||
      error.hasErrorLabel?.('UnknownTransactionCommitResult')
    )
  }

  /**
   * Execute multiple operations atomically
   */
  static async executeAtomic<T>(
    operations: Array<(session: ClientSession) => Promise<any>>
  ): Promise<T[]> {
    return this.withTransaction(async (session) => {
      const results: any[] = []
      for (const operation of operations) {
        const result = await operation(session)
        results.push(result)
      }
      return results
    })
  }
}

/**
 * Repository base class with transaction support
 * Implements Repository pattern for clean architecture
 */
export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  /**
   * Find one document with optional session
   */
  async findOne(
    filter: any,
    session?: ClientSession
  ): Promise<T | null> {
    return this.model.findOne(filter).session(session || null).exec()
  }

  /**
   * Find multiple documents with optional session
   */
  async find(
    filter: any,
    options?: {
      limit?: number
      skip?: number
      sort?: any
      session?: ClientSession
    }
  ): Promise<T[]> {
    let query = this.model.find(filter)

    if (options?.session) {
      query = query.session(options.session)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.skip) {
      query = query.skip(options.skip)
    }
    if (options?.sort) {
      query = query.sort(options.sort)
    }

    return query.exec()
  }

  /**
   * Create document with optional session
   */
  async create(
    data: any,
    session?: ClientSession
  ): Promise<any> {
    const docs = await this.model.create([data], { session })
    return docs[0]
  }

  /**
   * Update document with optional session
   */
  async updateOne(
    filter: any,
    update: any,
    session?: ClientSession
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, update, {
        new: true,
        session: session || undefined,
      })
      .exec()
  }

  /**
   * Delete document with optional session
   */
  async deleteOne(
    filter: any,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.model
      .deleteOne(filter)
      .session(session || null)
      .exec()
    return result.deletedCount > 0
  }

  /**
   * Count documents
   */
  async count(filter: any, session?: ClientSession): Promise<number> {
    return this.model
      .countDocuments(filter)
      .session(session || null)
      .exec()
  }

  /**
   * Check if document exists
   */
  async exists(filter: any, session?: ClientSession): Promise<boolean> {
    const count = await this.count(filter, session)
    return count > 0
  }
}

/**
 * Unit of Work pattern for managing multiple repository operations
 */
export class UnitOfWork {
  private session: ClientSession | null = null
  private isActive = false

  async begin(): Promise<void> {
    if (this.isActive) {
      throw new Error('Unit of Work already started')
    }

    this.session = await mongoose.startSession()
    this.session.startTransaction()
    this.isActive = true
    logger.debug('Unit of Work started')
  }

  getSession(): ClientSession {
    if (!this.session) {
      throw new Error('Unit of Work not started')
    }
    return this.session
  }

  async commit(): Promise<void> {
    if (!this.isActive || !this.session) {
      throw new Error('Unit of Work not active')
    }

    try {
      await this.session.commitTransaction()
      logger.debug('Unit of Work committed')
    } finally {
      await this.session.endSession()
      this.session = null
      this.isActive = false
    }
  }

  async rollback(): Promise<void> {
    if (!this.isActive || !this.session) {
      return
    }

    try {
      await this.session.abortTransaction()
      logger.debug('Unit of Work rolled back')
    } finally {
      await this.session.endSession()
      this.session = null
      this.isActive = false
    }
  }

  /**
   * Execute work with automatic commit/rollback
   */
  async execute<T>(
    work: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    await this.begin()
    
    try {
      const result = await work(this.getSession())
      await this.commit()
      return result
    } catch (error) {
      await this.rollback()
      throw error
    }
  }
}

/**
 * Optimistic locking support for preventing race conditions
 */
export function withOptimisticLocking(schema: mongoose.Schema<any>) {
  // Increment version on save
  schema.pre('save', function(this: any) {
    this.increment()
  })

  // Add method to check version
  schema.methods.checkVersion = function(this: any, expectedVersion: number): boolean {
    return this.__v === expectedVersion
  }
}

/**
 * Example: User repository with transaction support
 */
import User, { IUser } from '../models/User'

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User)
  }

  async findByEmail(email: string, session?: ClientSession): Promise<any> {
    return this.findOne({ email: email.toLowerCase() }, session)
  }

  async findById(id: string, session?: ClientSession): Promise<IUser | null> {
    return this.findOne({ _id: id }, session)
  }

  async createUser(data: Partial<IUser>, session?: ClientSession): Promise<IUser> {
    return this.create(data, session)
  }

  async updateUser(
    id: string,
    data: Partial<IUser>,
    session?: ClientSession
  ): Promise<IUser | null> {
    return this.updateOne({ _id: id }, data, session)
  }

  async deleteUser(id: string, session?: ClientSession): Promise<boolean> {
    return this.deleteOne({ _id: id }, session)
  }
}
