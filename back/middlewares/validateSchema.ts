import { Response, Request, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import { ResponseHTTP } from '../shared/interfaces';

export async function validateSchema(
  req: Request,
  res: Response,
  next: NextFunction,
  schema: Schema,
) {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    let customError: ResponseHTTP;
    if (error instanceof ZodError) {
      customError = {
        error: true,
        message: error.issues,
        statusCode: 400,
        data: null,
      };
    } else {
      customError = {
        error: true,
        message: error,
        statusCode: 400,
        data: null,
      };
    }

    res.status(400).json(customError);
  }
}
