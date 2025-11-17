// import { I18n, type MessageDescriptor } from "@lingui/core";
import "@testing-library/jest-dom/extend-expect";
// import type React from "react";
import cacheMock from "~/test/cacheMock";
import { restoreConsoleOutput, spyConsoleOutput } from "~/test/consoleMock";
import { matchMediaMock } from "~/test/matchMediaMock";

// jest.mock("@lingui/macro", () => ({
//   defineMessage: ({ id }: MessageDescriptor) => {
//     return id;
//   },

//   Trans: function TransMock({ children }: { children: React.ReactNode }) {
//     return children;
//   },

//   t: function tMock(arg1: I18n | TemplateStringsArray, ...placeholders: any[]): string {
//     if (arg1 instanceof I18n) {
//       // @ts-ignore
//       return (literals: TemplateStringsArray, ...placeholders: any[]) => {
//         return `${literals.join("")}`;
//       };
//     } else if (Array.isArray(arg1)) {
//       const literals = arg1 as TemplateStringsArray;
//       return `${literals.join("")}`;
//     } else {
//       const descriptor = arg1 as unknown as any;
//       return `${descriptor.message}`;
//     }
//   },

//   Plural: function PluralMock({
//     value,
//     one,
//     other
//   }: {
//     value: number;
//     one: React.ReactNode;
//     other: React.ReactNode;
//   }) {
//     return value !== 1 ? other : one;
//   },

//   plural: function pluralMock(
//     value: number,
//     {
//       one,
//       other
//     }: {
//       one: string;
//       other: string;
//     }
//   ) {
//     return value !== 1 ? other : one;
//   },

//   Select: function SelectMock({
//     value,
//     other,
//     ...choices
//   }: {
//     value: string;
//     other: string;
//     [key: string]: string;
//   }) {
//     return choices[value] ? choices[value] : other;
//   },

//   select: function selectMock(value: string, choices: Record<string, string>) {
//     return choices[value] ? choices[value] : value;
//   },

//   selectOrdinal: function selectOrdinalMock(value: number | string, options: Record<string, string>) {
//     let offset = "other";

//     if (value === "1" || value === 1) {
//       offset = "one";
//     } else if (value === "2" || value === 2) {
//       offset = "two";
//     } else if (value === "3" || value === 3) {
//       offset = "few";
//     } else {
//       offset = "other";
//     }

//     return options[offset] ?? options.other ?? value;
//   }
// }));

// jest.mock("~/translations/i18n", () => ({
//   allMessages: {
//     en: { message: "Hello" },
//     fr: { message: "Bonjour" }
//   },

//   getI18nInstance: function getI18nInstanceMock(locale: string) {
//     return new I18n({
//       locale: "en",
//       messages: {}
//     });
//   }
// }));

beforeEach(() => {
  matchMediaMock.mock();
});

beforeAll(() => cacheMock);

beforeEach(() => spyConsoleOutput());

afterEach(() => restoreConsoleOutput());
