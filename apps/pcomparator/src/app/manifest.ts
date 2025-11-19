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
        src: "/static/logo.png",
        sizes: "512x512",
        type: "image/png"
      },
      { form_factor: "wide", src: "/static/logo.png", sizes: "512x512", type: "image/png" }
    ],
    icons: [
      {
        src: "/static/logo.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    related_applications: [
      {
        platform: "webapp",
        url: "https://daezl.fr/manifest.webmanifest"
      }
    ],
    prefer_related_applications: true
  };
};
