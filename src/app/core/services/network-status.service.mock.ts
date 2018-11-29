import { Provider } from '@angular/core';

import { NetworkStatusService } from './network-status.service';

export class MockNetworkStatusService {
  readonly setServerError = jasmine.createSpy('setServerError');
  readonly setConnectionLost = jasmine.createSpy('setConnectionLost');
}

export const mockNetworkStatusServiceProvider: Provider = {
  provide: NetworkStatusService,
  useClass: MockNetworkStatusService
};
