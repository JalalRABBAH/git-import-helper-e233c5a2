import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { value: any; expiry: number }>();
  private readonly defaultTtl = 300; // 5 minutes

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') return next.handle();

    const cacheKey = `${request.method}:${request.url}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return of(cached.value);
    }

    return next.handle().pipe(
      tap(value => {
        this.cache.set(cacheKey, { value, expiry: Date.now() + this.defaultTtl * 1000 });
      }),
    );
  }
}
