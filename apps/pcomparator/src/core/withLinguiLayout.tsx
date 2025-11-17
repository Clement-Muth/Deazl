// @ts-ignore
import { setI18n } from "@lingui/react/server";
import type { ReactNode } from "react";
import type { AVAILABLE_LOCALES } from "~/core/locale";
import { getI18nInstance } from "~/translations/i18n";

export type PageLocaleParam = {
  params: Promise<{ locale: AVAILABLE_LOCALES }>;
};

type PageProps = PageLocaleParam & {
  searchParams?: any;
};

type LayoutProps = PageLocaleParam & {
  children: React.ReactNode;
};

type LayoutExposedToNextJS<Props extends LayoutProps> = (props: Props) => ReactNode;

type PageExposedToNextJS<Props extends PageProps> = (props: Props) => ReactNode;

export type NextPageProps = PageLocaleParam & PageProps & { locale: AVAILABLE_LOCALES; children: ReactNode };

export const withLinguiPage = <Props extends PageProps>(
  AppRouterPage: React.ComponentType<PageLocaleParam & Props & { locale: AVAILABLE_LOCALES }>
): PageExposedToNextJS<Props> => {
  return async function WithLingui(props) {
    const { locale } = await props.params;
    const i18n = getI18nInstance(locale);

    setI18n(i18n);

    return <AppRouterPage {...props} locale={locale} />;
  };
};

export const withLinguiLayout = <Props extends LayoutProps>(
  AppRouterPage: React.ComponentType<PageLocaleParam & Props & { locale: AVAILABLE_LOCALES }>
): LayoutExposedToNextJS<Props> => {
  return async function WithLingui(props) {
    const { locale } = await props.params;
    const i18n = getI18nInstance(locale);

    setI18n(i18n);

    return <AppRouterPage {...props} locale={locale} />;
  };
};
