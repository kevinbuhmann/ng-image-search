import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatInputModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxInViewportModule } from '@ngx-lite/in-viewport';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { retryInterceptorProvider } from './core/http-interceptors/retry.interceptor';
import { LoadingComponent } from './loading/loading.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [AppComponent, LoadingComponent, SearchComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxInViewportModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    AppRoutingModule
  ],
  providers: [retryInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule {}
