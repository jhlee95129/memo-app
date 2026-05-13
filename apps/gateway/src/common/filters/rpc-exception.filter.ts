import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface RpcError {
  statusCode?: number;
  message?: string;
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // NestJS HttpException (local guard errors, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(body);
      return;
    }

    // RpcException forwarded from microservices
    if (exception && typeof exception === 'object' && 'statusCode' in exception) {
      const rpcError = exception as RpcError;
      const statusCode = rpcError.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(statusCode).json({
        statusCode,
        message: rpcError.message ?? 'Internal server error',
      });
      return;
    }

    // Unknown errors
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
