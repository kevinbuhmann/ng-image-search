import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { toQueryString, QueryString } from './../../server/helpers/api.helpers';
import { ImageSearchResults, ImageSort } from './../../server/image-search/image-search.dtos';

const controlNames = {
  searchTerm: 'searchTerm',
  sort: 'sort'
};

interface FormValue {
  searchTerm: string;
  sort: string;
}

const defaultSort: ImageSort = 'relevance';

const sortOptions: { sort: ImageSort; label: string }[] = [
  {
    sort: 'relevance',
    label: 'Most Relevant'
  },
  {
    sort: 'interestingness-desc',
    label: 'Most Interesting'
  },
  {
    sort: 'date-posted-desc',
    label: 'Newly Posted'
  },
  {
    sort: 'date-taken-desc',
    label: 'Newly Taken'
  }
];

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  readonly form: FormGroup;
  readonly searchResults: Observable<ImageSearchResults>;

  readonly controlNames = controlNames;
  readonly sortOptions = sortOptions;

  private loadingResults = false;
  private readonly loadResultsPage = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly httpClient: HttpClient,
    private readonly router: Router
  ) {
    const initialFormValue: FormValue = {
      searchTerm: this.activatedRoute.snapshot.params['searchTerm'],
      sort: getInitialSort(activatedRoute.snapshot)
    };

    this.form = this.formBuilder.group({
      [controlNames.searchTerm]: [initialFormValue.searchTerm, Validators.required],
      [controlNames.sort]: [initialFormValue.sort, Validators.required]
    });

    this.searchResults = this.getSearchResults(initialFormValue).pipe(shareReplay(1));
  }

  loadMoreResults(inViewport: boolean) {
    if (inViewport && !this.loadingResults) {
      this.loadResultsPage.next(undefined);
    }
  }

  private getSearchResults(initialFormValue: FormValue) {
    return this.form.valueChanges.pipe(
      debounceTime(500),
      startWith(initialFormValue),
      tap(({ searchTerm, sort }) => {
        const routerLink = ['/search', ...(searchTerm ? [searchTerm] : [])];

        const queryParams = {
          [controlNames.sort]: sort === defaultSort ? undefined : sort
        };

        this.router.navigate(routerLink, { queryParams });
      }),
      switchMap(formValue => this.searchWithPagination(formValue).pipe(startWith<ImageSearchResults>(undefined)))
    );
  }

  private searchWithPagination({ searchTerm, sort }: FormValue) {
    return this.loadResultsPage.pipe(
      scan<number>(page => page + 1, 0),
      switchMap(page => this.loadSearchResults({ searchTerm, sort }, page)),
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

  private loadSearchResults({ searchTerm, sort }: FormValue, page: number) {
    const searchQueryString: QueryString = {
      q: searchTerm || 'undefined',
      sort,
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

function getInitialSort(activatedRouteSnapshot: ActivatedRouteSnapshot) {
  const sort: string = activatedRouteSnapshot.queryParams[controlNames.sort];

  return sortOptions.find(sortOption => sortOption.sort === sort) ? (sort as ImageSort) : defaultSort;
}
