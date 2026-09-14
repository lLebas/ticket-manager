import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Erro nao tratado:', err);
  res.status(500).json({ error: 'InternalServerError', message: 'erro interno inesperado' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'NotFoundError', message: `rota nao encontrada: ${req.method} ${req.path}` });
}
