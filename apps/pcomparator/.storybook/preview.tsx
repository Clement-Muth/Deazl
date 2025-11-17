import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import ApplicationProvider from "../src/core/ApplicationProvider";
import { AVAILABLE_LOCALES } from "../src/core/locale";
import "~/app/[locale]/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const decorators: Preview["decorators"] = [
  (Story, { globals: { locale } }) => {
    return (
      <div lang={locale} dir="ltr" className={inter.className}>
        <ApplicationProvider locale={locale}>
          <Story />
        </ApplicationProvider>
      </div>
    );
  }
];

const parameters: Preview["parameters"] = {
  nextjs: {
    appDirectory: true
  },
  layout: "fullscreen",
  actions: { argTypesRegex: "^on[A-Z].*" },
  options: {
    storySort: {
      method: "alphabetical",
      order: ["Components"]
    }
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  backgrounds: {
    default: "White",
    values: [
      {
        name: "dark",
        value: "black"
      },
      {
        name: "Cream",
        value: "white"
      },
      {
        name: "Cream dark",
        value: "white"
      }
    ]
  },
  viewport: { viewports: INITIAL_VIEWPORTS, defaultViewport: "desktop" }
};

export const globalTypes: Preview["globalTypes"] = {
  locale: {
    toolbar: {
      icon: "globe",
      items: [
        { value: AVAILABLE_LOCALES.en, right: "🇺🇸", title: "English" },
        { value: AVAILABLE_LOCALES.fr, right: "🇫🇷", title: "French" }
      ]
    },
    name: "Locale",
    description: "Internationalization locale",
    defaultValue: AVAILABLE_LOCALES.en
  }
};

const preview: Preview = {
  parameters,
  decorators,
  globalTypes
};

export default preview;
