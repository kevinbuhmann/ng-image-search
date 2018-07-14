import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackNodeExternals from 'webpack-node-externals';

interface Options {
  prod?: boolean;
}

// tslint:disable-next-line:no-default-export
export default (env: Options = {}) => ({
  target: 'node',
  mode: env.prod ? 'production' : 'development',
  devtool: 'source-map',
  externals: [webpackNodeExternals()],
  entry: {
    server: './src/server/main.ts'
  },
  output: {
    path: path.resolve('./dist/server'),
    filename: '[name].js'
  },
  stats: {
    assets: true,
    children: false
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  optimization: {
    minimize: false,
    noEmitOnErrors: true
  },
  plugins: [new webpack.NormalModuleReplacementPlugin(/environments\/environment/, getEnvironmentPath(env))]
});

function getEnvironmentPath(env: Options) {
  let environmentPath: string;

  if (env.prod) {
    environmentPath = 'environments/environment.prod.ts';
  } else {
    environmentPath = 'environments/environment.ts';
  }

  return path.resolve('src', environmentPath);
}
