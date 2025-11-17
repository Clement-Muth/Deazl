import path, { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("storybook-dark-mode"),
    {
      name: "storybook-addon-module-mock",
      options: {
        exclude: ["**/node_modules/@mui/**"]
      }
    }
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: "../next.config.js",
      builder: {
        fsCache: true
      }
    }
  },
  core: {
    disableTelemetry: true
  },
  features: {
    experimentalRSC: true
  },
  typescript: {
    reactDocgen: false
  },
  webpack(baseConfig) {
    baseConfig.resolve = {
      ...(baseConfig.resolve ?? {}),
      alias: {
        ...(baseConfig.resolve?.alias ?? {}),
        "@lingui/macro": path.resolve(__dirname, "../__mocks__/@lingui/macro.ts"),
        "~/storybook/*": path.resolve(__dirname, "./*"),
        "@opentelemetry/api": "next/dist/compiled/@opentelemetry/api"
      }
    };
    return baseConfig;
  }
};

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}

export default config;
