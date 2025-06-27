import { Response } from 'express';

/**
 * API Response Utility
 * Provides standardized API response format
 */
export class ApiResponse {
  /**
   * Send success response
   * @param res Express response object
   * @param data Response data
   * @param statusCode HTTP status code (default: 200)
   */
  static success(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send paginated response
   * @param res Express response object
   * @param data Response data
   * @param page Current page number
   * @param limit Items per page
   * @param total Total number of items
   * @param statusCode HTTP status code (default: 200)
   */
  static paginated(
    res: Response,
    data: any[],
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  }

  /**
   * Send created response
   * @param res Express response object
   * @param data Response data
   */
  static async created(res: Response, data: any) {
    return this.success(res, data, 201);
  }

  /**
   * Send no content response
   * @param res Express response object
   */
  static async noContent(res: Response) {
    return res.status(204).end();
  }

  static async validationError(res: Response, errors: any) {
    return res.status(422).json({
      success: false,
      errors,
    });
  }

  static async unauthorized(res: Response, message: string) {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  static async forbidden(res: Response, message: string) {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  static async notFound(res: Response, message: string) {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  static async getPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }


}