import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from './../../../../node_modules/@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  readonly serverError: Observable<boolean>;
  readonly connectionLost: Observable<boolean>;

  private readonly serverErrorSubject = new BehaviorSubject(false);
  private readonly connectionLostSubject = new BehaviorSubject(false);

  constructor() {
    this.serverError = this.serverErrorSubject.asObservable();
    this.connectionLost = this.connectionLostSubject.asObservable();
  }

  setServerError(value: boolean) {
    this.serverErrorSubject.next(value);
  }

  setConnectionLost(value: boolean) {
    this.connectionLostSubject.next(value);
  }
}
