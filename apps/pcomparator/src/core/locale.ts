export enum AVAILABLE_LOCALES {
  en = "en",
  fr = "fr"
}

export const DEFAULT_LOCALE = AVAILABLE_LOCALES.en;

export function isAcceptedLocale(locale: unknown): locale is AVAILABLE_LOCALES {
  if (typeof locale !== "string") {
    return false;
  }

  return locale in AVAILABLE_LOCALES;
}

export function selectFirstAcceptedLocale(...mayBeLocales: Array<unknown>): AVAILABLE_LOCALES {
  for (const mayBeLocale of mayBeLocales) {
    if (isAcceptedLocale(mayBeLocale)) {
      return mayBeLocale;
    }
  }

  return DEFAULT_LOCALE;
}

export const locales = ["en", "fr"] as const;

type PathnameLocale = {
  pathname: string;
  locale?: never;
};
type ISOLocale = {
  pathname?: never;
  locale: string;
};

type LocaleSource = PathnameLocale | ISOLocale;

export const getLocalePartsFrom = ({ pathname, locale }: LocaleSource) => {
  if (locale) {
    const localeParts = locale.toLowerCase().split("-");
    return {
      lang: localeParts[0],
      country: localeParts[1]
    };
  }
  const pathnameParts = pathname?.toLowerCase().split("/");
  return pathnameParts?.at(1);
};
