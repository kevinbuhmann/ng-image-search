import chalk from 'chalk';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

import { execute, executeParallel } from './helpers/shell.helpers';
import { bail, bailIf, parseFlags } from './helpers/utility.helpers';

interface Options {
  clean: boolean;
  lint: boolean;
  watch: boolean;
  test: boolean;
  prod: boolean;
}

const defaultOptionsFn = (args: Options) => ({
  clean: true,
  lint: !args.watch,
  watch: false,
  test: false,
  prod: false
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

bailIf(options.watch && options.prod, '--watch and --prod are mutually exclusive.');
bailIf(options.watch && options.test, '--watch and --test are mutually exclusive.');

(async () => {
  if (options.clean) {
    clean();
  }

  if (options.lint) {
    await execute('ts-node ./build/lint.ts');
  }

  await build();

  if (options.test) {
    await execute('ts-node ./build/test.ts');
  }
})();

function clean() {
  console.log(`\n${chalk.gray('cleaning...')}`);

  try {
    rimraf.sync('dist');
    fs.mkdirSync('dist');
  } catch (e) {
    bail(`Failed to clean the dist folder. ${e.message}`);
  }
}

async function build() {
  const configuration = options.prod ? 'production' : '';

  const ngOptions =
    ` --configuration ${configuration}` + ` ${options.watch ? '--watch' : '--aot'}` + ` ${options.prod ? '--prod --build-optimizer' : ''}`;

  const webpackOptions = ` ${options.watch ? '--watch' : ''}` + ` ${options.prod ? '--env.prod' : ''}`;

  const clientBuild = collapseSpaces(`ng build ${ngOptions}`);
  const serverWebpackBuild = collapseSpaces(`webpack --config ./build/webpack/webpack.server.ts --progress ${webpackOptions}`);

  if (options.watch) {
    await executeParallel(clientBuild, serverWebpackBuild);
  } else {
    await execute(clientBuild);
    await execute(serverWebpackBuild);
  }
}

function collapseSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}
