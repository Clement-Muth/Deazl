import { type RenderOptions, render as originalRender } from "@testing-library/react";
import type React from "react";
import { AVAILABLE_LOCALES } from "~/core/locale";

type CustomTestWrapperOptions = {
  locale?: AVAILABLE_LOCALES;
  query?: Record<string, string | Array<string> | undefined>;
  isUserAuthenticated?: boolean;
  user?: {} | undefined;
};

export const TestWrapper = ({
  locale = AVAILABLE_LOCALES.en,
  children
}: {
  children?: React.ReactNode;
} & CustomTestWrapperOptions) => {
  return children;
  // <FakeNextJsApplication>
  // <ApplicationKernel locale={locale}>{children}</ApplicationKernel>
  // </FakeNextJsApplication>
};

const customRender = (
  ui: React.ReactElement,
  options?: RenderOptions & CustomTestWrapperOptions
): ReturnType<typeof originalRender> => {
  return originalRender(ui, {
    wrapper: ({ children }) => <TestWrapper {...options}>{children}</TestWrapper>,
    ...options
  });
};

// To many element to by explicitly imported/exported
export * from "@testing-library/react";

export { customRender as render };

export { default as userEvent } from "@testing-library/user-event";
