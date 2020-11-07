import { Controller, Get, Query } from '@nestjs/common';
import { map } from 'rxjs/operators';

import { FlickrSearchResults, FlickrService } from './../services/flickr.service';
import { ImageSearchResults, Photo } from './image-search.dtos';

@Controller('api/image-search')
export class ImageSearchController {
  constructor(private readonly flickrService: FlickrService) {}

  @Get()
  search(@Query('q') searchTerm: string, @Query('page') page: string) {
    return this.flickrService
      .search({ searchTerm, page: +page })
      .pipe(map(flickrSearchResults => convertSearchResults(searchTerm, +page, flickrSearchResults)));
  }
}

function convertSearchResults(searchTerm: string, page: number, flickrSearchResults: FlickrSearchResults) {
  const photos = flickrSearchResults.photos.photo.map<Photo>(photo => ({
    title: photo.title,
    url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
    thumbnailUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`
  }));

  const searchResults: ImageSearchResults = { searchTerm, page, total: +flickrSearchResults.photos.total, photos };

  return searchResults;
}
