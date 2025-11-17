import {
  AppRouterContext,
  type AppRouterInstance
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type React from "react";
import { AVAILABLE_LOCALES } from "~/core/locale";

type FakeRouterProps = Partial<AppRouterInstance>;

type FakeNextJsApplicationProps = {
  children: React.ReactNode;
  router?: FakeRouterProps;
};

export const routerPushMock = jest.fn().mockResolvedValue(true);
export const routerReplaceMock = jest.fn().mockResolvedValue(true);
export const routerReloadMock = jest.fn().mockReturnValue(null);
export const routerBackMock = jest.fn().mockReturnValue(null);
export const routerForwardMock = jest.fn().mockReturnValue(null);

const FakeNextJsRouter = ({
  children,
  ...router
}: FakeRouterProps & {
  children: React.ReactNode;
}): React.ReactElement<FakeNextJsApplicationProps> => {
  const {
    push = routerPushMock,
    replace = routerReplaceMock,
    back = routerBackMock,
    refresh = routerBackMock,
    forward = routerForwardMock,
    prefetch = async () => undefined
  } = router || {};

  return (
    <AppRouterContext.Provider
      value={{
        prefetch,
        push,
        refresh,
        replace,
        back,
        forward
      }}
    >
      {children}
    </AppRouterContext.Provider>
  );
};

export const FakeNextJsApplication = ({
  children,
  router
}: FakeNextJsApplicationProps): React.ReactElement<FakeNextJsApplicationProps> => {
  return <FakeNextJsRouter {...router}>{children}</FakeNextJsRouter>;
};

export const generateFakeI18nProps = () => {
  return {
    _i18nPropsNamespace: {
      initialLocale: AVAILABLE_LOCALES.en,
      initialMessages: {}
    },
    locale: AVAILABLE_LOCALES.en
  };
};
