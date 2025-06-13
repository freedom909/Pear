import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { 
  PaginationOptions, 
  PaginatedResult, 
  QueryFilters, 
  QueryOptions 
} from '../models';

/**
 * Base service class for common database operations
 */
export abstract class BaseService<T extends Document> {
  /**
   * Constructor
   * @param model Mongoose model
   */
  constructor(protected model: Model<T>) {}

  /**
   * Create a new document
   * @param data Document data
   * @returns Created document
   */
  async create(data: Record<string, any>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find document by ID
   * @param id Document ID
   * @param options Query options
   * @returns Found document or null
   */
  async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    try {
      let query = this.model.findById(id);
      
      // Apply select fields
      if (options.select) {
        query = query.select(options.select);
      }
      
      // Apply populate
      if (options.populate) {
        query = this.applyPopulate(query, options.populate);
      }
      
      // Apply lean option
      if (options.lean) {
        query = query.lean();
      }
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find one document by filter
   * @param filter Filter criteria
   * @param options Query options
   * @returns Found document or null
   */
  async findOne(filter: FilterQuery<T>, options: QueryOptions = {}): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);
      
      // Apply select fields
      if (options.select) {
        query = query.select(options.select);
      }
      
      // Apply populate
      if (options.populate) {
        query = this.applyPopulate(query, options.populate);
      }
      
      // Apply lean option
      if (options.lean) {
        query = query.lean();
      }
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find documents with pagination
   * @param filter Filter criteria
   * @param options Query options
   * @returns Paginated result
   */
  async findWithPagination(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      // Prepare sort options
      const sort: Record<string, 1 | -1> = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort['createdAt'] = -1; // Default sort by createdAt desc
      }
      
      // Count total documents
      const total = await this.model.countDocuments(filter).exec();
      
      // Find documents
      let query = this.model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Apply select fields
      if (options.select) {
        query = query.select(options.select);
      }
      
      // Apply populate
      if (options.populate) {
        query = this.applyPopulate(query, options.populate);
      }
      
      // Apply lean option
      if (options.lean) {
        query = query.lean();
      }
      
      const data = await query.exec();
      
      return {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find all documents
   * @param filter Filter criteria
   * @param options Query options
   * @returns Array of documents
   */
  async findAll(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    try {
      // Prepare sort options
      const sort: Record<string, 1 | -1> = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort['createdAt'] = -1; // Default sort by createdAt desc
      }
      
      let query = this.model.find(filter).sort(sort);
      
      // Apply select fields
      if (options.select) {
        query = query.select(options.select);
      }
      
      // Apply populate
      if (options.populate) {
        query = this.applyPopulate(query, options.populate);
      }
      
      // Apply lean option
      if (options.lean) {
        query = query.lean();
      }
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update document by ID
   * @param id Document ID
   * @param update Update data
   * @returns Updated document
   */
  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update one document by filter
   * @param filter Filter criteria
   * @param update Update data
   * @returns Updated document
   */
  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndUpdate(
        filter,
        update,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update many documents by filter
   * @param filter Filter criteria
   * @param update Update data
   * @returns Update result
   */
  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<{ matchedCount: number; modifiedCount: number }> {
    try {
      const result = await this.model.updateMany(
        filter,
        update,
        { runValidators: true }
      ).exec();
      
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete document by ID
   * @param id Document ID
   * @returns Deleted document or null
   */
  async deleteById(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete one document by filter
   * @param filter Filter criteria
   * @returns Deleted document or null
   */
  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndDelete(filter).exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete many documents by filter
   * @param filter Filter criteria
   * @returns Delete count
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    try {
      const result = await this.model.deleteMany(filter).exec();
      return result.deletedCount;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Count documents by filter
   * @param filter Filter criteria
   * @returns Document count
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if document exists
   * @param filter Filter criteria
   * @returns True if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this.model.exists(filter);
      return !!result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Apply populate to query
   * @param query Mongoose query
   * @param populate Populate options
   * @returns Query with populate applied
   */
  protected applyPopulate(query: any, populate: string | string[] | Record<string, any>): any {
    if (Array.isArray(populate)) {
      // Array of paths
      populate.forEach(path => {
        query = query.populate(path);
      });
    } else if (typeof populate === 'string') {
      // Single path
      query = query.populate(populate);
    } else if (typeof populate === 'object') {
      // Object with path and options
      query = query.populate(populate);
    }
    
    return query;
  }

  /**
   * Handle database errors
   * @param error Error object
   * @returns Processed error
   */
  protected handleError(error: any): Error {
    // Handle specific database errors here
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const errors: Record<string, string> = {};
      
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      
      return new Error(`Validation Error: ${JSON.stringify(errors)}`);
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      return new Error(`Duplicate value for ${field}: ${value}`);
    }
    
    // Return original error if not handled
    return error;
  }
}