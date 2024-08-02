module.exports = {
  plugin: {
    configure: ({ webpackConfig }) => {
      webpackConfig.resolve.extensions.push('.wasm');
      webpackConfig.experiments = {
        asyncWebAssembly: true,
        layers: true,
        syncWebAssembly: true,
      };

      // turn off static file serving of WASM files
      // we need to let Webpack handle WASM import
      webpackConfig.module.rules
        .find((i) => 'oneOf' in i)
        .oneOf.find((i) => i.type === 'asset/resource')
        .exclude.push(/\.wasm$/);

      return webpackConfig;

      // const wasmExtensionRegExp = /\.wasm$/;
      // webpackConfig.resolve.extensions.push('.wasm');
      // webpackConfig.experiments = {
      //   syncWebAssembly: true,
      // };

      // webpackConfig.module.rules.forEach((rule) => {
      //   (rule.oneOf || []).forEach((oneOf) => {
      //     if (oneOf.type === 'asset/resource') {
      //       oneOf.exclude.push(wasmExtensionRegExp);
      //     }
      //   });
      // });

      // webpackConfig.module.rules.push({
      //   sideEffects: true,
      // });

      // return webpackConfig;

      // ---

      //   webpackConfig.experiments = { asyncWebAssembly: true };

      //   // The last rule in the react-scripts webpack.config.js is a
      //   // file-loader which loads any asset not caught by previous rules. We
      //   // need to exclude `.wasm` files so that they are instead loaded by
      //   // webpacks internal webassembly loader (which I believe is enabled by
      //   // the experiment setting above).
      //   //
      //   // See https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-scripts/config/webpack.config.js#L587
      //   webpackConfig.module.rules
      //     .at(-1)
      //     .oneOf.at(-1)
      //     .exclude.push(/\.wasm$/);
      //   return webpackConfig;
    },
  },
};
