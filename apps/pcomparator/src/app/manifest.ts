import type { MetadataRoute } from "next";

export default (): MetadataRoute.Manifest => {
  return {
    name: "Deazl - Compare Prices Easily",
    short_name: "Deazl",
    description:
      "Deazl is a web app that helps you compare prices for food, cosmetics, and more to find the best deals near you.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef2ff",
    theme_color: "#eef2ff",
    orientation: "portrait",
    dir: "ltr",
    lang: "en",
    id: "/?source=pwa",
    scope: "/",
    screenshots: [
      {
        src: "/static/manifest/screenshots/home-page.png",
        sizes: "895x2040",
        type: "image/png"
      },
      {
        src: "/static/manifest/screenshots/signed-home-page.png",
        sizes: "895x2040",
        type: "image/png"
      },
      {
        src: "/static/manifest/screenshots/shopping-list.png",
        sizes: "895x2040",
        type: "image/png"
      },
      {
        src: "/static/manifest/screenshots/product-quality.png",
        sizes: "895x2040",
        type: "image/png"
      }
    ],
    shortcuts: [
      {
        name: "Shopping List",
        url: "/shopping-list"
      },
      {
        name: "recipes",
        url: "/recipes"
      }
    ],
    icons: [
      {
        src: "/static/manifest/android/android-launchericon-512-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable"
      },
      {
        src: "/static/manifest/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/static/manifest/android/android-launchericon-144-144.png",
        type: "image/png",
        sizes: "144x144",
        purpose: "any"
      },
      {
        src: "/static/manifest/android/android-launchericon-96-96.png",
        type: "image/png",
        sizes: "96x96",
        purpose: "any"
      },
      {
        src: "/static/manifest/android/android-launchericon-72-72.png",
        type: "image/png",
        sizes: "72x72",
        purpose: "any"
      },
      {
        src: "/static/manifest/android/android-launchericon-48-48.png",
        type: "image/png",
        sizes: "48x48",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/16.png",
        type: "image/png",
        sizes: "16x16",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/20.png",
        type: "image/png",
        sizes: "20x20",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/29.png",
        type: "image/png",
        sizes: "29x29",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/32.png",
        type: "image/png",
        sizes: "32x32",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/40.png",
        type: "image/png",
        sizes: "40x40",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/50.png",
        type: "image/png",
        sizes: "50x50",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/57.png",
        type: "image/png",
        sizes: "57x57",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/58.png",
        type: "image/png",
        sizes: "58x58",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/60.png",
        type: "image/png",
        sizes: "60x60",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/64.png",
        type: "image/png",
        sizes: "64x64",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/72.png",
        type: "image/png",
        sizes: "72x72",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/76.png",
        type: "image/png",
        sizes: "76x76",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/80.png",
        type: "image/png",
        sizes: "80x80",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/87.png",
        type: "image/png",
        sizes: "87x87",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/100.png",
        type: "image/png",
        sizes: "100x100",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/114.png",
        type: "image/png",
        sizes: "114x114",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/120.png",
        type: "image/png",
        sizes: "120x120",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/128.png",
        type: "image/png",
        sizes: "128x128",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/144.png",
        type: "image/png",
        sizes: "144x144",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/152.png",
        type: "image/png",
        sizes: "152x152",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/167.png",
        type: "image/png",
        sizes: "167x167",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/180.png",
        type: "image/png",
        sizes: "180x180",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/256.png",
        type: "image/png",
        sizes: "256x256",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any"
      },
      {
        src: "/static/manifest/ios/1024.png",
        type: "image/png",
        sizes: "1024x1024",
        purpose: "any"
      }
    ]
  };
};
