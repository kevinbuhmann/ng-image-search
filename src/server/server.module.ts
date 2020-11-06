import { HttpModule, Module } from '@nestjs/common';

import { ImageSearchController } from './image-search/image-search.controller';
import { FlickrService } from './services/flickr.service';

@Module({
  imports: [HttpModule],
  controllers: [ImageSearchController],
  providers: [FlickrService]
})
export class ServerModule {}
