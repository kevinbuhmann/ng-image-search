import { execute } from './helpers/shell.helpers';
import { parseFlags } from './helpers/utility.helpers';

const defaultOptionsFn = () => ({
  coverage: false,
  sourcemaps: true,
  watch: false
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

(async () => {
  const watch = options.watch ? '--watch' : '--no-watch';
  const coverage = options.coverage ? '--code-coverage' : '--no-code-coverage';
  const sourcemaps = options.sourcemaps ? '--source-map' : '--no-source-map';

  await execute(`ng test ${watch} ${coverage} ${sourcemaps}`);
})();
