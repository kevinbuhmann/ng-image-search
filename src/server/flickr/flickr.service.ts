import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

import { environmentVariables } from './../environment-variables';
import { toQueryString, QueryString } from './../helpers/api.helpers';
import { FlickrSearchResults } from './flickr.dtos';

const apiRoot = 'https://api.flickr.com/services/rest/';

const baseApiRequestQueryString: QueryString = {
  format: 'json',
  nojsoncallback: '1',
  api_key: environmentVariables.flickrApiKey
};

@Injectable()
export class FlickrService {
  constructor(private readonly httpService: HttpService) {}

  search(searchTerm: string) {
    const requestQueryString: QueryString = {
      ...baseApiRequestQueryString,
      method: 'flickr.photos.search',
      text: searchTerm,
      sort: 'relevance'
    };

    return this.httpService
      .get<FlickrSearchResults>(`${apiRoot}?${toQueryString(requestQueryString)}`)
      .pipe(map(response => response.data));
  }
}
