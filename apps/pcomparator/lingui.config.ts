export const locales = ["fr", "en"];
export const sourceLocale = "en";
export const format = "po";
export const formatOptions = {
  lineNumbers: false
};

export const catalogs = [
  {
    path: "<rootDir>/src/translations/messages/{locale}",
    include: ["<rootDir>"],
    exclude: ["**/.next/**", "**/*.d.ts", "**/node_modules/**", "**/__mocks__/@lingui/*"]
  }
];
