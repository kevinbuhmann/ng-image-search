import { Injectable, Provider } from '@angular/core';
import { HttpRequestRetryStrategy, HTTP_REQUEST_RETRY_STRATEGIES } from '@ngx-utilities/http-retry';

import { NetworkStatusService } from './../services/network-status.service';

@Injectable()
export class NetworkErrorRetryStrategy implements HttpRequestRetryStrategy {
  readonly statuses = [0];
  readonly maxCount = 3;

  constructor(private readonly networkStatusService: NetworkStatusService) {}

  delayFn(retryNumber: number) {
    return retryNumber === 1 ? 0 : 3000;
  }

  onFailure() {
    this.networkStatusService.setConnectionLost(true);
  }
}

export const networkErrorRetryStrategyProvider: Provider = {
  provide: HTTP_REQUEST_RETRY_STRATEGIES,
  useClass: NetworkErrorRetryStrategy,
  multi: true
};
