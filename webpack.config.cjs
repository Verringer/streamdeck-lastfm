const path = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { createDevelopmentManifest, manifestNs } = require('./build/scripts/manifest');

module.exports = (_environment, options) => {
  const pluginNs = options.mode === 'development' ? `dev.${manifestNs}` : manifestNs;

  return {
    entry: {
      plugin: './build/entries/PluginEntry.ts',
      propertyinspector: './build/entries/PropertyinspectorEntry.ts',
    },
    target: 'web',
    output: {
      library: 'connectElgatoStreamDeckSocket',
      libraryExport: 'default',
      path: path.resolve(__dirname, `dist/${pluginNs}.sdPlugin/js`),
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'assets',
            to: path.resolve(__dirname, `dist/${pluginNs}.sdPlugin`),
            toType: 'dir',
            globOptions: {
              dot: false,
            },
            transform: (content, absolutePath) => {
              if (options.mode === 'development' && /manifest\.json$/.test(absolutePath)) {
                return createDevelopmentManifest();
              }
              return /\.html$/.test(absolutePath) ? content.toString().replace('{{ PLUGIN_NS }}', pluginNs) : content;
            },
          },
        ],
      }),
      new ForkTsCheckerWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  };
};
