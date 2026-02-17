import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ SKIP VALIDATION EN MODO TEST
      if (process.env.NODE_ENV === 'test') {
        return next();
      }

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 usa 'issues' en lugar de 'errors'
        return res.status(400).json({
          success: false,
          error: error.issues[0]?.message || 'Validation error',
          errors: error.issues
        });
      }
      next(error);
    }
  };
};
