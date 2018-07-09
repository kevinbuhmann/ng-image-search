import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CustomRoute } from './core/routing/custom-route';
import { customUrlMatcher } from './core/routing/custom-url-matcher';
import { SearchComponent } from './search/search.component';

const routes: CustomRoute[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
  },
  {
    customPath: 'search/:searchTerm?',
    matcher: customUrlMatcher,
    component: SearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
