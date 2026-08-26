/** @type {import('next').NextConfig} */
const { version } = require("./package.json");

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
  // Branding is administrator-managed at runtime. Do not precache these
  // public assets in the service worker or an old Pingvin/OODA logo can
  // survive a normal refresh after the asset changes.
  publicExcludes: [
    "!noprecache/**/*",
    "!img/logo.png",
    "!img/logo-dark.png",
    "!img/favicon.ico",
    "!img/icons/**/*",
  ],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkOnly",
    },
  ],
});

module.exports = withPWA({
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  output: "standalone",
  images: {
    unoptimized: true,
  },
  env: {
    VERSION: version,
  },
});
