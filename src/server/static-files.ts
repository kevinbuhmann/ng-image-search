import * as express from 'express';
import * as path from 'path';
import { ServeStaticOptions } from 'serve-static';

const clientRoot = './dist/client';
const resolvePath = (filePath: string) => path.resolve(`${clientRoot}/${filePath}`);

const staticOptions: ServeStaticOptions = {
  redirect: false
};

const staticFileHandler = express.static('./dist/client', staticOptions);

export function staticFileHandlerWithFallback(req: express.Request, res: express.Response, next: express.NextFunction) {
  const fallback: express.NextFunction = () => {
    const extensionlessUrlRegex = /\/[^.]*(\?.+)?$/; // no period except in query string

    if (req.method === 'GET' && !req.url.startsWith('/api') && extensionlessUrlRegex.test(req.url)) {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(resolvePath('index.html'));
    } else {
      next();
    }
  };

  staticFileHandler(req, res, fallback);
}
