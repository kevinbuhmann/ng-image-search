import { TestBed } from '@angular/core/testing';

import { NetworkStatusService } from './../services/network-status.service';
import { mockNetworkStatusServiceProvider, MockNetworkStatusService } from './../services/network-status.service.mock';
import { ServerUnavailableRetryStrategy } from './server-unavailable.retry-strategy';

describe('ServerUnavailableRetryStrategy', () => {
  let mockNetworkStatusService: MockNetworkStatusService;
  let serverUnavailableRetryStrategy: ServerUnavailableRetryStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerUnavailableRetryStrategy, mockNetworkStatusServiceProvider]
    });

    mockNetworkStatusService = TestBed.get(NetworkStatusService);
    serverUnavailableRetryStrategy = TestBed.get(ServerUnavailableRetryStrategy);
  });

  it('should wait 3 seconds between retries', () => {
    for (let retryNumber = 1; retryNumber <= serverUnavailableRetryStrategy.maxCount; retryNumber++) {
      expect(serverUnavailableRetryStrategy.delayFn(retryNumber)).toBe(3000);
    }
  });

  it('should set server error on failure', () => {
    serverUnavailableRetryStrategy.onFailure();

    expect(mockNetworkStatusService.setServerError).toHaveBeenCalled();
    expect(mockNetworkStatusService.setConnectionLost).not.toHaveBeenCalled();
  });
});
