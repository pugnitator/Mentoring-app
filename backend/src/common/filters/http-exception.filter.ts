import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

export interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, code, message } = this.normalizeException(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} ${statusCode} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json(errorResponse);
  }

  private normalizeException(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as Record<string, unknown>)
          : { message: exceptionResponse };

      let message = 'Внутренняя ошибка сервера';
      if (typeof body['message'] === 'string') {
        message = body['message'];
      } else if (Array.isArray(body['message'])) {
        message = (body['message'] as string[]).join(', ');
      }

      const code =
        (body['error'] as string) ||
        (status === HttpStatus.BAD_REQUEST && body['message'] ? 'VALIDATION_ERROR' : 'HTTP_EXCEPTION');
      return {
        statusCode: status,
        code,
        message,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const target = (exception.meta?.target as string[]) || [];
        if (target.includes('email')) {
          return {
            statusCode: HttpStatus.CONFLICT,
            code: 'EMAIL_EXISTS',
            message: 'Пользователь с таким email уже зарегистрирован',
          };
        }
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'DATABASE_ERROR',
        message: 'Ошибка при работе с базой данных',
      };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'Некорректные данные запроса',
      };
    }

    const message =
      exception instanceof Error ? exception.message : 'Внутренняя ошибка сервера';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message,
    };
  }
}
