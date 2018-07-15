import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { NetworkStatusService } from './core/service/network-status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly showNetworkError: Observable<boolean>;

  constructor(private readonly networkStatusService: NetworkStatusService) {
    this.showNetworkError = this.networkStatusService.showNetworkError;
  }

  tryAgain() {
    this.networkStatusService.setShowNetworkError(false);
  }
}
