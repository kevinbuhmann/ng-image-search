import { NestFactory } from '@nestjs/core';

import { environmentVariables } from './environment-variables';
import { ServerModule } from './server.module';
import { staticFileHandlerWithFallback } from './static-files';

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);

  app.use(staticFileHandlerWithFallback);
  await app.listen(environmentVariables.port);
}

bootstrap();
