import { HttpService, Injectable } from '@nestjs/common';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, scan, skip } from 'rxjs/operators';

import { ImageSort } from './.././image-search/image-search.dtos';
import { environmentVariables } from './../environment-variables';
import { toQueryString, QueryString } from './../helpers/api.helpers';

const apiRoot = 'https://api.flickr.com/services/rest/';

const baseApiRequestQueryString: QueryString = {
  format: 'json',
  nojsoncallback: '1',
  api_key: environmentVariables.flickrApiKey
};

export interface FlickrSearchResults {
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: string;
    photo: {
      id: string;
      owner: string;
      secret: string;
      server: string;
      farm: number;
      title: string;
      ispublic: number;
      isfriend: number;
      isfamily: number;
      datetaken: string;
      ownername: string;
      views: string;
      license: string;
    }[];
  };
  stat: string;
}

@Injectable()
export class FlickrService {
  constructor(private readonly httpService: HttpService) {}

  search({ searchTerm, page, sort, licenseIds }: { searchTerm: string; page: number; sort: ImageSort; licenseIds: number[] }) {
    if (isNaN(page)) {
      return this.pagelessSearch({ searchTerm, sort, licenseIds });
    }

    const requestQueryString: QueryString = {
      ...baseApiRequestQueryString,
      method: 'flickr.photos.search',
      text: searchTerm,
      sort,
      page,
      safe_search: '1',
      license: licenseIds ? licenseIds.join() : undefined,
      extras: 'datetaken,owner_name,views,license'
    };

    return this.httpService
      .get<FlickrSearchResults>(`${apiRoot}?${toQueryString(requestQueryString)}`)
      .pipe(map(response => response.data));
  }

  private pagelessSearch(searchOptions: { searchTerm: string; sort: ImageSort; licenseIds: number[] }): Observable<FlickrSearchResults> {
    const maxPage = 10;

    return this.search({ ...searchOptions, page: 1 }).pipe(
      expand(results => (results.photos.page < maxPage ? this.search({ ...searchOptions, page: results.photos.page + 1 }) : EMPTY)),
      scan((current, next) => {
        const combinedSearchResults: FlickrSearchResults = {
          photos: {
            page: undefined,
            pages: undefined,
            perpage: undefined,
            total: current.photos.total,
            photo: [...current.photos.photo, ...next.photos.photo]
          },
          stat: undefined
        };
        return combinedSearchResults;
      }),
      skip(maxPage - 1)
    );
  }
}
