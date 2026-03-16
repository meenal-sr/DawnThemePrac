const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const stats = mode === 'development' ? 'errors-only' : { children: false };
require('dotenv').config();
const storeUrl = process.env.STORE_URL;
const themeId = process.env.THEME_ID;

const scssEntryPoint = glob.sync('./scss/sections/**.scss').reduce((acc, p) => {
  acc[p.replace(/^.*[\\\/]/, '').replace('.scss', '')] = p;
  return acc;
}, {});

const jsEntryPoints = glob.sync('./js/sections/**/**.js').reduce((acc, p) => {
  acc[p.replace(/^.*[\\\/]/, '').replace('.js', '')] = p;
  return acc;
}, {});

const tsEntryPoints = glob.sync('./src/sections/**/*.{ts,tsx}').reduce((acc, filePath) => {
  acc[filePath.replace(/^.*[\\\/]/, '').replace(/\.(ts|tsx)$/, '')] = filePath;
  return acc;
}, {});

const entry = { ...scssEntryPoint, ...jsEntryPoints, ...tsEntryPoints };

module.exports = {
  mode,
  stats,
  entry,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      StyleComponents: path.resolve(__dirname, 'scss/components'),
      JsComponents: path.resolve(__dirname, 'js/components'),
      SvelteComponents: path.resolve(__dirname, 'src/svelte'),
      'scss/sections/common-import.scss': path.resolve(__dirname, 'scss/sections/common-imports.scss'),
      'scss/sections/common-imports.scss': path.resolve(__dirname, 'scss/sections/common-imports.scss'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(sc|sa)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              implementation: require('sass'),
            },
          },
        ],
      },
    ],
  },
  output: {
    clean: false,
    filename: './[name].js',
    path: path.resolve(__dirname, 'assets'),
    chunkFilename: './[name].js?[chunkhash]',
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: './[name].css',
    }),
  ],
};

if (mode === 'development') {
  module.exports.devtool = false;
  module.exports.optimization = {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      usedExports: true,
      cacheGroups: {
        default: false,
        Vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          type: /javascript/,
          enforce: true,
        },
        common: {
          chunks: 'all',
          minChunks: 2,
          name: 'shared',
          priority: -20,
          minSize: 0,
          type: /javascript/,
        },
      },
    },
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
  };
  module.exports.plugins.push(
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: ['echo Webpack build in progress...🛠'],
      },
      onBuildEnd: {
        scripts: ['echo Build Complete 📦', `shopify theme dev --theme-editor-sync -s ${storeUrl} -t ${themeId}`],
        parallel: true,
      },
    })
  );
}

if (mode === 'production') {
  module.exports.optimization = {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      usedExports: true,
      cacheGroups: {
        default: false,
        Vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          type: /javascript/,
          enforce: true,
        },
        common: {
          chunks: 'all',
          minChunks: 2,
          name: 'shared',
          priority: -20,
          minSize: 0,
          type: /javascript/,
        },
      },
    },
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
  };
}
