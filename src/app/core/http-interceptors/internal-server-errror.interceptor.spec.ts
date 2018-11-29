import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NetworkStatusService } from './../services/network-status.service';
import { mockNetworkStatusServiceProvider, MockNetworkStatusService } from './../services/network-status.service.mock';
import { internalServerErrorInterceptorProvider } from './internal-server-errror.interceptor';

describe('InternalServerErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockNetworkStatusService: MockNetworkStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [mockNetworkStatusServiceProvider, internalServerErrorInterceptorProvider]
    });

    httpMock = TestBed.get(HttpTestingController);
    httpClient = TestBed.get(HttpClient);
    mockNetworkStatusService = TestBed.get(NetworkStatusService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should set server error if an HTTP 500 is received', () => {
    httpClient.get('/api/pages').subscribe(undefined, swallowError);

    httpMock.expectOne('/api/pages').flush('', { status: 500, statusText: 'Internal Server Error' });
    expect(mockNetworkStatusService.setServerError).toHaveBeenCalledWith(true);
    expect(mockNetworkStatusService.setConnectionLost).not.toHaveBeenCalled();
  });

  it('should do nothing if the response is successful', () => {
    httpClient.get('/api/pages').subscribe();

    httpMock.expectOne('/api/pages').flush('', { status: 200, statusText: 'OK' });
    expect(mockNetworkStatusService.setServerError).not.toHaveBeenCalled();
    expect(mockNetworkStatusService.setConnectionLost).not.toHaveBeenCalled();
  });

  it('should do nothing if the error is not an HTTP 500', () => {
    httpClient.get('/api/pages').subscribe(undefined, swallowError);

    httpMock.expectOne('/api/pages').flush('', { status: 502, statusText: 'Bad Gateway' });
    expect(mockNetworkStatusService.setServerError).not.toHaveBeenCalled();
    expect(mockNetworkStatusService.setConnectionLost).not.toHaveBeenCalled();
  });

  it('should do nothing if the request method is not GET', () => {
    httpClient.put('/api/pages', '').subscribe(undefined, swallowError);

    httpMock.expectOne('/api/pages').flush('', { status: 500, statusText: 'Internal Server Error' });
    expect(mockNetworkStatusService.setServerError).not.toHaveBeenCalled();
    expect(mockNetworkStatusService.setConnectionLost).not.toHaveBeenCalled();
  });
});

function swallowError() {
  // do nothing
}
