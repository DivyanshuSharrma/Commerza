import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    
    let message = exception.message || 'Internal server error';
    let details: any = null;

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      details = (exceptionResponse as any).error || null;
    }

    // Handle class-validator detailed errors
    if (exceptionResponse && Array.isArray((exceptionResponse as any).message)) {
      message = 'Validation failed';
      details = (exceptionResponse as any).message;
    }

    response.status(status).json({
      success: false,
      error: {
        message,
        statusCode: status,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
