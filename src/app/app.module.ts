import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxInViewportModule } from '@ngx-lite/in-viewport';
import { HttpRetryModule } from '@ngx-utilities/http-retry';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { internalServerErrorInterceptorProvider } from './core/http-interceptors/internal-server-errror.interceptor';
import { networkErrorRetryStrategyProvider } from './core/http-retry-strategies/network-error.retry-strategy';
import { serverUnavailableRetryStrategyProvider } from './core/http-retry-strategies/server-unavailable.retry-strategy';
import { LoadingComponent } from './loading/loading.component';
import { SearchComponent } from './search/search.component';

const httpInterceptorProviders = [internalServerErrorInterceptorProvider];

const httpRetryStrategyProviders = [networkErrorRetryStrategyProvider, serverUnavailableRetryStrategyProvider];

@NgModule({
  declarations: [AppComponent, LoadingComponent, SearchComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxInViewportModule,
    HttpRetryModule.forRoot(),
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatToolbarModule,
    AppRoutingModule
  ],
  providers: [...httpInterceptorProviders, ...httpRetryStrategyProviders],
  bootstrap: [AppComponent]
})
export class AppModule {}
