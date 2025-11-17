/**
 * @jest-environment jsdom
 */
import {
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  getLocalePartsFrom,
  isAcceptedLocale,
  selectFirstAcceptedLocale
} from "~/core/locale";

describe("isAcceptedLocale function", () => {
  it("returns true for accepted locales", () => {
    expect(isAcceptedLocale(AVAILABLE_LOCALES.en)).toBe(true);
    expect(isAcceptedLocale(AVAILABLE_LOCALES.fr)).toBe(true);
  });

  it("returns false for non-string values", () => {
    expect(isAcceptedLocale(123)).toBe(false);
    expect(isAcceptedLocale(null)).toBe(false);
    expect(isAcceptedLocale(undefined)).toBe(false);
    expect(isAcceptedLocale({})).toBe(false);
    expect(isAcceptedLocale(["en"])).toBe(false);
  });

  it("returns false for unsupported locales", () => {
    expect(isAcceptedLocale("de")).toBe(false);
    expect(isAcceptedLocale("es")).toBe(false);
  });
});

describe("selectFirstAcceptedLocale function", () => {
  it("returns the first accepted locale from the arguments", () => {
    expect(selectFirstAcceptedLocale("de", "fr", "es")).toBe(AVAILABLE_LOCALES.fr);
    expect(selectFirstAcceptedLocale("de", "es", "en")).toBe(AVAILABLE_LOCALES.en);
  });

  it("returns the default locale if no accepted locale is found", () => {
    expect(selectFirstAcceptedLocale("de", "es")).toBe(DEFAULT_LOCALE);
    expect(selectFirstAcceptedLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe("getLocalePartsFrom function", () => {
  it("returns language and country parts when locale is provided", () => {
    const localeSource = { locale: "en-US" };
    expect(getLocalePartsFrom(localeSource)).toEqual({ lang: "en", country: "us" });
  });

  it("returns the second part of the pathname when locale is not provided", () => {
    const localeSource = { pathname: "/fr/home" };
    expect(getLocalePartsFrom(localeSource)).toBe("fr");
  });
});
