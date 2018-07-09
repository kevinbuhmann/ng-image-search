import { HttpModule, Module } from '@nestjs/common';

import { FlickrController } from './flickr/flickr.controller';
import { FlickrService } from './flickr/flickr.service';

@Module({
  imports: [HttpModule],
  controllers: [FlickrController],
  providers: [FlickrService]
})
export class ServerModule {}
