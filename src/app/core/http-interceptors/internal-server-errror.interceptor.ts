import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NetworkStatusService } from './../services/network-status.service';

@Injectable()
export class InternalServerErrorInterceptor implements HttpInterceptor {
  constructor(private readonly networkStatusService: NetworkStatusService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let result: Observable<HttpEvent<any>>;

    if (request.method.toUpperCase() === 'GET') {
      result = next.handle(request).pipe(
        tap(undefined, error => {
          if (error instanceof HttpErrorResponse && error.status === 500) {
            this.networkStatusService.setServerError(true);
          }
        })
      );
    } else {
      result = next.handle(request);
    }

    return result;
  }
}

export const internalServerErrorInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: InternalServerErrorInterceptor,
  multi: true
};
