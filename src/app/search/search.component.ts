import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { toQueryString, QueryString } from './../../server/helpers/api.helpers';
import { ImageSearchResults, ImageSort } from './../../server/image-search/image-search.dtos';
import { imageLicenses } from './../core/static-data/image-licenses';

const controlNames = {
  searchTerm: 'searchTerm',
  sort: 'sort',
  license: 'license'
};

interface FormValue {
  searchTerm: string;
  sort: string;
  licenseIds: number[];
}

const defaultSort: ImageSort = 'relevance';
const allLicenseIds = Object.keys(imageLicenses)
  .map(licenseId => +licenseId)
  .sort((a, b) => a - b);

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
  readonly imageLicenses = imageLicenses;

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
      sort: getInitialSort(activatedRoute.snapshot),
      licenseIds: getInitialLicenseIds(activatedRoute.snapshot)
    };

    this.form = this.formBuilder.group({
      [controlNames.searchTerm]: [initialFormValue.searchTerm, Validators.required],
      [controlNames.sort]: [initialFormValue.sort, Validators.required],
      [controlNames.license]: new FormArray(
        allLicenseIds.map(licenseId => new FormControl(initialFormValue.licenseIds.includes(licenseId)))
      )
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
      map<any, FormValue>(formValue => ({
        searchTerm: formValue[controlNames.searchTerm],
        sort: formValue[controlNames.sort],
        licenseIds: getTrueIndexes(formValue[controlNames.license])
      })),
      startWith(initialFormValue),
      tap(({ searchTerm, sort, licenseIds }) => {
        const joinedLicenseIds = licenseIds.sort((a, b) => a - b).join();
        const routerLink = ['/search', ...(searchTerm ? [searchTerm] : [])];

        const queryParams = {
          [controlNames.sort]: sort === defaultSort ? undefined : sort,
          [controlNames.license]: joinedLicenseIds === allLicenseIds.join() ? undefined : joinedLicenseIds
        };

        this.router.navigate(routerLink, { queryParams });
      }),
      switchMap(formValue => this.searchWithPagination(formValue).pipe(startWith<ImageSearchResults>(undefined)))
    );
  }

  private searchWithPagination({ searchTerm, sort, licenseIds }: FormValue) {
    return this.loadResultsPage.pipe(
      scan<number>(page => page + 1, 0),
      switchMap(page => this.loadSearchResults({ searchTerm, sort, licenseIds }, page)),
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

  private loadSearchResults({ searchTerm, sort, licenseIds }: FormValue, page: number) {
    const searchQueryString: QueryString = {
      q: searchTerm || 'undefined',
      sort,
      page,
      licenseIds: licenseIds.join()
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

function getInitialLicenseIds(activatedRouteSnapshot: ActivatedRouteSnapshot) {
  const licenseIds: string = activatedRouteSnapshot.queryParams[controlNames.license];

  return licenseIds
    ? licenseIds
        .split(',')
        .map(licenseId => +licenseId)
        .filter(licenseId => isNaN(licenseId) === false)
    : allLicenseIds;
}

function getTrueIndexes(values: boolean[]) {
  const result: number[] = [];

  for (let i = 0; i < values.length; ++i) {
    if (values[i] === true) {
      result.push(i);
    }
  }

  return result;
}
