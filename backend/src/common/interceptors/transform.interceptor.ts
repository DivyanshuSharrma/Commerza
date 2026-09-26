import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // If it's a download request or redirect (like download gateway), don't wrap the response
    const http = context.switchToHttp();
    const req = http.getRequest();
    if (req.url.includes('/download/d/')) {
      return next.handle();
    }

    return next.handle().pipe(map(data => ({ success: true, data })));
  }
}
