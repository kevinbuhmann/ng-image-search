import { TestBed } from '@angular/core/testing';

import { NetworkStatusService } from '../services/network-status.service';

import { mockNetworkStatusServiceProvider, MockNetworkStatusService } from './../services/network-status.service.mock';
import { NetworkErrorRetryStrategy } from './network-error.retry-strategy';

describe('NetworkErrorRetryStrategy', () => {
  let mockNetworkStatusService: MockNetworkStatusService;
  let networkErrorRetryStrategy: NetworkErrorRetryStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NetworkErrorRetryStrategy, mockNetworkStatusServiceProvider]
    });

    mockNetworkStatusService = TestBed.get(NetworkStatusService);
    networkErrorRetryStrategy = TestBed.get(NetworkErrorRetryStrategy);
  });

  it('should retry immediately the first time', () => {
    expect(networkErrorRetryStrategy.delayFn(1)).toBe(0);
  });

  it('should wait 3 seconds after the first retry', () => {
    for (let retryNumber = 2; retryNumber <= networkErrorRetryStrategy.maxCount; retryNumber++) {
      expect(networkErrorRetryStrategy.delayFn(retryNumber)).toBe(3000);
    }
  });

  it('should set connection lost on failure', () => {
    networkErrorRetryStrategy.onFailure();

    expect(mockNetworkStatusService.setConnectionLost).toHaveBeenCalled();
    expect(mockNetworkStatusService.setServerError).not.toHaveBeenCalled();
  });
});
