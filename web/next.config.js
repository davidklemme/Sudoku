/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: (config) => {
    // Support for Web Workers
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: "worker-loader" },
    });
    return config;
  },
};

module.exports = nextConfig;
