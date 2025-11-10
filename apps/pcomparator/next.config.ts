import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const readEnvironmentVariable = (key: string, defaultValue: string | undefined = undefined): string => {
  const value = process.env[key];

  if (value === undefined && defaultValue === undefined) {
    throw new Error(`The environment variable "${key} is missing".`);
  }

  return value!;
};

const PCOMPARATOR_ENV = readEnvironmentVariable("PCOMPARATOR_ENV", "production");

const nextConfig = (): NextConfig => {

  if (!["development", "test", "staging", "production"].includes(PCOMPARATOR_ENV)) {
    throw new Error(
      `The environment variable "PCOMPARATOR_ENV" should have one the value: "development", "test", "staging", "production". Current value: "${PCOMPARATOR_ENV}"`
    );
  }

  return {
    env: {
      PCOMPARATOR_ENV,
      PCOMPARATOR_API_ENDPOINT: readEnvironmentVariable("PCOMPARATOR_API_ENDPOINT"),
      OPEN_FOOD_FACT_API_ENDPOINT: readEnvironmentVariable("OPEN_FOOD_FACT_API_ENDPOINT"),
      OPEN_FOOD_FACT_PRICES_API_ENDPOINT: readEnvironmentVariable("OPEN_FOOD_FACT_PRICES_API_ENDPOINT"),
      ALGOLIA_APP_ID: readEnvironmentVariable("ALGOLIA_APP_ID")!,
      ALGOLIA_API_KEY: readEnvironmentVariable("ALGOLIA_API_KEY")!,
    },
    trailingSlash: false,
    reactStrictMode: true,
    compress: true,
    images: {
      domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com", "vercel.com", "images.openfoodfacts.org", 'gqvzqowza5fybgb2.public.blob.vercel-storage.com']
    },
    experimental: {
      turbo: {
        rules: {
          "*.po": {
            loaders: ["@lingui/loader"]
          }
        }
      },
      swcPlugins: [["@lingui/swc-plugin", {}]],
      serverActions: {
        bodySizeLimit: "3mb"
      }
    },
  };
};

const withPWA = withPWAInit({
  dest: "public",
  disable: false
});

module.exports = withPWA(nextConfig());
