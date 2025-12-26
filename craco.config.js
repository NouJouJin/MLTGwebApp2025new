const { ProvidePlugin } = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url/"),
        "process/browser": require.resolve("process/browser"), // 念のため
      };
      webpackConfig.resolve.extensions = ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']; // '.mjs' を追加
      webpackConfig.plugins.push(
        new ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      );
      return webpackConfig;
    },
  },
};