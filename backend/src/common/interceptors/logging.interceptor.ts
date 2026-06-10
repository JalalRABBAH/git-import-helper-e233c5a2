import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const userAgent = request.headers['user-agent'] || 'unknown';
    const clientIp = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log(`${method} ${url} ${duration}ms - ${clientIp} - ${userAgent}`);
        },
        error: (err) => {
          const duration = Date.now() - now;
          this.logger.error(`${method} ${url} ${duration}ms - ${err.status || 500} - ${clientIp}`);
        },
      }),
    );
  }
}
