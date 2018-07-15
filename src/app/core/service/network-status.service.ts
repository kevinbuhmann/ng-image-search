import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  readonly showNetworkError: Observable<boolean>;

  private readonly showNetworkErrorSubject = new BehaviorSubject(false);

  constructor() {
    this.showNetworkError = this.showNetworkErrorSubject.asObservable();
  }

  setShowNetworkError(value: boolean) {
    this.showNetworkErrorSubject.next(value);
  }
}
