import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

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
    }[];
  };
  stat: string;
}

@Injectable()
export class FlickrService {
  constructor(private readonly httpService: HttpService) {}

  search({ searchTerm, page }: { searchTerm: string; page: number }) {
    const requestQueryString: QueryString = {
      ...baseApiRequestQueryString,
      method: 'flickr.photos.search',
      text: searchTerm,
      sort: 'relevance',
      page,
      safe_search: '1'
    };

    return this.httpService
      .get<FlickrSearchResults>(`${apiRoot}?${toQueryString(requestQueryString)}`)
      .pipe(map(response => response.data));
  }
}
