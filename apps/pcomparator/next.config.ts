import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const readEnvironmentVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`The environment variable "${key}" is missing.`);
  }
  return value ?? defaultValue!;
};

const PCOMPARATOR_ENV = readEnvironmentVariable("PCOMPARATOR_ENV", "production");

const nextConfig = (): NextConfig => {
  if (!["development", "test", "staging", "production"].includes(PCOMPARATOR_ENV)) {
    throw new Error(
      `The environment variable "PCOMPARATOR_ENV" should have one of the following values: "development", "test", "staging", "production". Current value: "${PCOMPARATOR_ENV}"`
    );
  }

  return {
    env: {
      PCOMPARATOR_ENV,
      PCOMPARATOR_API_ENDPOINT: readEnvironmentVariable("PCOMPARATOR_API_ENDPOINT"),
      OPEN_FOOD_FACT_API_ENDPOINT: readEnvironmentVariable("OPEN_FOOD_FACT_API_ENDPOINT"),
      OPEN_FOOD_FACT_PRICES_API_ENDPOINT: readEnvironmentVariable("OPEN_FOOD_FACT_PRICES_API_ENDPOINT"),
      AUTH_GOOGLE_ID: readEnvironmentVariable("AUTH_GOOGLE_ID"),
    },
    trailingSlash: false,
    reactStrictMode: true,
    compress: true,    
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
        },
        {
          protocol: "https",
          hostname: "firebasestorage.googleapis.com",
        },
        {
          protocol: "https",
          hostname: "vercel.com",
        },
        {
          protocol: "https",
          hostname: "images.openfoodfacts.org",
        },
        {
          protocol: "https",
          hostname: "C1Z8OicjMsptiuIJ.public.blob.vercel-storage.com",
        },
      ],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: "10mb",
      },
      swcPlugins: [["@lingui/swc-plugin", {}]],
    },
    turbopack: {
      rules: {
        "*.po": {
          loaders: ["@lingui/loader"],
          as: "*.js",
        },
      },
    },
    output: "standalone",
  };
};

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
});

module.exports = withPWA(nextConfig());
