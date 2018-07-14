import { Injectable, Provider } from '@angular/core';
import { HttpRequestRetryStrategy, HTTP_REQUEST_RETRY_STRATEGIES } from '@ngx-utilities/http-retry';

import { NetworkStatusService } from './../services/network-status.service';

@Injectable()
export class ServerUnavailableRetryStrategy implements HttpRequestRetryStrategy {
  readonly statuses = [502, 503];
  readonly maxCount = 10;

  constructor(private readonly networkStatusService: NetworkStatusService) {}

  delayFn() {
    return 3000;
  }

  onFailure() {
    this.networkStatusService.setServerError(true);
  }
}

export const serverUnavailableRetryStrategyProvider: Provider = {
  provide: HTTP_REQUEST_RETRY_STRATEGIES,
  useClass: ServerUnavailableRetryStrategy,
  multi: true
};
