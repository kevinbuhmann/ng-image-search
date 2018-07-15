import { HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay, retryWhen, switchMap } from 'rxjs/operators';

@Injectable()
export class RetryIntercpetor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const handleRequest = next.handle(request);

    if (request.method.toUpperCase() === 'GET') {
      return handleRequest
        .pipe(
          retryWhen(errors => errors.pipe(switchMap((error, index) => (index < 3 ? of(undefined).pipe(delay(2000)) : throwError(error)))))
        );
    } else {
      return handleRequest;
    }
  }
}

export const retryInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: RetryIntercpetor,
  multi: true
};
