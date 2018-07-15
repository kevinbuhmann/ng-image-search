import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, delay, map, retryWhen, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { FlickrSearchResults } from './../../server/flickr/flickr.dtos';
import { toQueryString, QueryString } from './../../server/helpers/api.helpers';

const controlNames = {
  searchTerm: 'searchTerm'
};

interface Photo {
  title: string;
  url: string;
  thumbnailUrl: string;
}

interface SearchResults {
  searchTerm: string;
  total: number;
  photos: Photo[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  readonly form: FormGroup;
  searchResults: Observable<SearchResults>;

  readonly controlNames = controlNames;

  showError = false;

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

  tryAgain() {
    this.searchResults = this.getSearchResults(this.form.controls[controlNames.searchTerm].value);
    this.showError = false;
  }

  private getSearchResults(initialSearchTerm: string) {
    return this.form.controls[controlNames.searchTerm].valueChanges.pipe(
      debounceTime(500),
      startWith(initialSearchTerm),
      tap(searchTerm => {
        this.router.navigate(['/search', ...(searchTerm ? [searchTerm] : [])]);
      }),
      switchMap(searchTerm => this.searchWithPagination(searchTerm).pipe(startWith<SearchResults>(undefined))),
      tap(undefined, () => {
        this.showError = true;
      })
    );
  }

  private searchWithPagination(searchTerm: string) {
    return this.loadResultsPage.pipe(
      scan<number>(page => page + 1, 0),
      switchMap(page => this.loadSearchResults(searchTerm, page)),
      scan((current, next) => {
        const combinedSearchResults: SearchResults = {
          searchTerm,
          total: current.total,
          photos: [...current.photos, ...next.photos]
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
      switchMap(() => this.httpClient.get<FlickrSearchResults>(`/api/flickr/search?${toQueryString(searchQueryString)}`)),
      retryWhen(errors => errors.pipe(switchMap((error, index) => (index < 3 ? of(undefined).pipe(delay(2000)) : throwError(error))))),
      map(flickrSearchResults => convertSearchResults(searchTerm, flickrSearchResults)),
      tap(() => {
        this.loadingResults = false;
      })
    );
  }
}

function convertSearchResults(searchTerm: string, flickrSearchResults: FlickrSearchResults) {
  const photos = flickrSearchResults.photos.photo.map<Photo>(photo => ({
    title: photo.title,
    url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
    thumbnailUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`
  }));

  const searchResults: SearchResults = { searchTerm, total: +flickrSearchResults.photos.total, photos };

  return searchResults;
}