import {
  type RenderHookOptions,
  type RenderHookResult,
  type WrapperComponent,
  renderHook as originalRenderHook
} from "@testing-library/react-hooks";
import type React from "react";
import type { ReactNode } from "react";
import ApplicationKernel from "~/core/ApplicationKernel";
import { AVAILABLE_LOCALES } from "~/core/locale";
import { FakeNextJsApplication } from "~/test/applicationUtils";

export type CustomTestWrapperOptions = {
  locale?: AVAILABLE_LOCALES;
  isUserAuthenticated?: boolean;
  children?: React.ReactNode;
};

export const TestWrapper = ({ locale = AVAILABLE_LOCALES.en, children }: CustomTestWrapperOptions) => {
  return (
    <FakeNextJsApplication>
      <ApplicationKernel locale={locale}>{children}</ApplicationKernel>
    </FakeNextJsApplication>
  );
};

const customRenderHook = <CProps extends WrapperComponent<CProps> & { children: ReactNode }, CResult>(
  callback: (props: CProps) => CResult,
  options?: RenderHookOptions<CProps> & CustomTestWrapperOptions
): RenderHookResult<CProps, CResult> => {
  return originalRenderHook(callback, {
    wrapper: ({ children }) => <TestWrapper {...options}>{children}</TestWrapper>
  });
};

// To many element to by explicitly imported/exported
// eslint-disable-next-line import/export
export * from "@testing-library/react-hooks";

// eslint-disable-next-line import/export
export { customRenderHook as renderHook };
