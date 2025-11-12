import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export function handleServiceError(
  error: unknown,
  context: string,
  logger: Logger,
): never {
  if (error instanceof HttpException) {
    throw error;
  }

  logger.error(`${context} - Unexpected error`, error);
  throw new InternalServerErrorException(`${context} - Failed`);
}
