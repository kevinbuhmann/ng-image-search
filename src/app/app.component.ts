import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { NetworkStatusService } from './core/services/network-status.service';

enum View {
  ConnectionLost,
  Content,
  ServerError
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly View = View;
  readonly currentView: Observable<View>;

  constructor(private readonly networkStatusService: NetworkStatusService) {
    this.currentView = this.getCurrentView().pipe(shareReplay(1));
  }

  resetAllNetworkErrors() {
    this.networkStatusService.setServerError(false);
    this.networkStatusService.setConnectionLost(false);
  }

  private getCurrentView() {
    return combineLatest(this.networkStatusService.connectionLost, this.networkStatusService.serverError).pipe(
      map(([connectionLost, serverError]) => {
        if (connectionLost) {
          return View.ConnectionLost;
        } else if (serverError) {
          return View.ServerError;
        } else {
          return View.Content;
        }
      })
    );
  }
}
