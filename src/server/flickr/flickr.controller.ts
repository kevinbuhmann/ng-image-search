import { Controller, Get, Query } from '@nestjs/common';

import { FlickrService } from './flickr.service';

@Controller('api/flickr')
export class FlickrController {
  constructor(private readonly flickrService: FlickrService) {}

  @Get('/search')
  search(@Query('q') searchTerm: string, @Query('page') page: string) {
    return this.flickrService.search(searchTerm, +page);
  }
}
