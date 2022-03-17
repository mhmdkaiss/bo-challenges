const packg = require('./package.json');
const path = require('path');
const { override, adjustStyleLoaders, addWebpackResolve } = require('customize-cra');

// CSS prefix
const cssPrefix = `__${packg.name}`;

module.exports = {
  webpack: override(
    addWebpackResolve({
      alias: {
        'webapp__package.json': path.resolve('./package.json'),
      },
    }),
    adjustStyleLoaders(({ use }) => {
      // Add CSS prefix in SASS
      const sassLoader = use.find(l => l.loader && l.loader.includes(path.join('', 'sass-loader', '')));
      if (sassLoader) {
        if (!sassLoader.options) {
          sassLoader.options = {};
        }
        sassLoader.options.prependData = `$root: '.' + ${cssPrefix};`;
      }

      // Add prefix-css-loader and string-replace-loader
      const cssLoaderIdx = use.findIndex(l => l.loader && l.loader.includes(path.join('', 'css-loader', '')));
      if (cssLoaderIdx !== -1) {
        use.splice(cssLoaderIdx + 1, 0, {
          loader: require.resolve('prefix-css-loader'),
          options: {
            selector: `.${cssPrefix}`,
            exclude: new RegExp(`.${cssPrefix}`),
            minify: false
          },
        }, {
          loader: 'string-replace-loader',
          options: {
            multiple: [
              {
                search: new RegExp(`(.${cssPrefix}\\s*)?html|body`),
                replace: `.${cssPrefix}`,
                flags: 'g',
              },
              {
                search: new RegExp(`(.${cssPrefix}\\s*)+`),
                replace: `.${cssPrefix}`,
                flags: 'g',
              },
            ],
          },
        });
      }
    }),
  ),
};
