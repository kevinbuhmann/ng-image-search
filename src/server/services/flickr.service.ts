import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

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
}
