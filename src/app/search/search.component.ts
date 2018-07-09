import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { FlickrSearchResults } from './../../server/flickr/flickr.dtos';

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
  photos: Photo[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  readonly form: FormGroup;
  readonly searchResults: Observable<SearchResults>;

  readonly controlNames = controlNames;

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

  private getSearchResults(initialSearchTerm: string) {
    return this.form.controls[controlNames.searchTerm].valueChanges.pipe(
      debounceTime(500),
      startWith(initialSearchTerm),
      tap(searchTerm => {
        this.router.navigate(['/search', ...(searchTerm ? [searchTerm] : [])]);
      }),
      switchMap(searchTerm => this.search(searchTerm).pipe(startWith<SearchResults>(undefined)))
    );
  }

  private search(searchTerm: string) {
    return this.httpClient.get<FlickrSearchResults>(`/api/flickr/search?q=${encodeURIComponent(searchTerm || undefined)}`).pipe(
      map(results => {
        const photos = results.photos.photo.map<Photo>(photo => ({
          title: photo.title,
          url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
          thumbnailUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`
        }));

        const searchResults: SearchResults = { searchTerm, photos };

        return searchResults;
      })
    );
  }
}
