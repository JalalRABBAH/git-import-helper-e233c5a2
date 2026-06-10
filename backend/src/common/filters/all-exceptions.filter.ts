import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  requestId: string;
  details?: Record<string, unknown>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException
      ? exception.message : 'Une erreur interne est survenue';

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: exception instanceof HttpException ? exception.name : 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request.headers['x-request-id'] as string) || 'unknown',
    };

    if (exception instanceof HttpException) {
      const excResp = exception.getResponse() as any;
      if (typeof excResp === 'object' && excResp?.message) {
        errorResponse.message = Array.isArray(excResp.message)
          ? excResp.message.join(', ') : excResp.message;
        if (excResp.error) errorResponse.error = excResp.error;
        errorResponse.details = excResp.details;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}
