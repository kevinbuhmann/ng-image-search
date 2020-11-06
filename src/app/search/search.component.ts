import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { toQueryString, QueryString } from './../../server/helpers/api.helpers';
import { ImageSearchResults } from './../../server/image-search/image-search.dtos';

const controlNames = {
  searchTerm: 'searchTerm'
};

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  readonly form: FormGroup;
  readonly searchResults: Observable<ImageSearchResults>;

  readonly controlNames = controlNames;

  private loadingResults = false;
  private readonly loadResultsPage = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly httpClient: HttpClient,
    private readonly router: Router
  ) {
    const initialSearchTerm = this.activatedRoute.snapshot.params['searchTerm'];

    this.form = this.formBuilder.group({
      [controlNames.searchTerm]: [initialSearchTerm, Validators.required]
    });

    this.searchResults = this.getSearchResults(initialSearchTerm).pipe(shareReplay(1));
  }

  loadMoreResults(inViewport: boolean) {
    if (inViewport && !this.loadingResults) {
      this.loadResultsPage.next(undefined);
    }
  }

  private getSearchResults(initialSearchTerm: string) {
    return this.form.controls[controlNames.searchTerm].valueChanges.pipe(
      debounceTime(500),
      startWith(initialSearchTerm),
      tap(searchTerm => {
        this.router.navigate(['/search', ...(searchTerm ? [searchTerm] : [])]);
      }),
      switchMap(searchTerm => this.searchWithPagination(searchTerm).pipe(startWith<ImageSearchResults>(undefined)))
    );
  }

  private searchWithPagination(searchTerm: string) {
    return this.loadResultsPage.pipe(
      scan<number>(page => page + 1, 0),
      switchMap(page => this.loadSearchResults(searchTerm, page)),
      scan((current, next) => {
        const combinedSearchResults: ImageSearchResults = {
          searchTerm,
          page: undefined,
          total: current.total,
          images: [...current.images, ...next.images]
        };

        return combinedSearchResults;
      })
    );
  }

  private loadSearchResults(searchTerm: string, page: number) {
    const searchQueryString: QueryString = {
      q: searchTerm || 'undefined',
      page
    };

    return of(undefined).pipe(
      tap(() => {
        this.loadingResults = true;
      }),
      switchMap(() => this.httpClient.get<ImageSearchResults>(`/api/image-search?${toQueryString(searchQueryString)}`)),
      tap(() => {
        this.loadingResults = false;
      })
    );
  }
}
