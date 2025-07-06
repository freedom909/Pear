import { Request, Response, NextFunction } from 'express';

/**
 * Generic async handler that supports custom request types.
 */
export const asyncHandler = <
  Req extends Request = Request,
  Res extends Response = Response
>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch(next);
  };
};
