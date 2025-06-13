import { Document } from 'mongoose';

/**
 * Base interface for all models
 */
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base interface for timestamps
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base interface for pagination
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base interface for pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Base interface for query filters
 */
export interface QueryFilters {
  [key: string]: any;
}

/**
 * Base interface for query options
 */
export interface QueryOptions extends PaginationOptions {
  select?: string | string[];
  populate?: string | string[] | Record<string, any>;
  lean?: boolean;
}