"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { I18nProvider } from "@react-aria/i18n";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Provider as ReactWrapBalancerProvider } from "react-wrap-balancer";
import DeviceProvider from "~/core/DeviceProvider";
import TranslationProvider from "~/core/TranslationProvider";
import type { AVAILABLE_LOCALES } from "~/core/locale";
import type { Device } from "~/types/device";

interface ApplicationProviderProps {
  children: ReactNode;
  locale: AVAILABLE_LOCALES;
  messages: any;
  device: Device;
}

const ApplicationProvider = ({ children, locale, messages, device }: ApplicationProviderProps) => {
  const router = useRouter();

  return (
    <SessionProvider>
      <HeroUIProvider locale={locale} navigate={router.push}>
        <I18nProvider locale={locale}>
          <NextThemesProvider defaultTheme="light" attribute="class" enableSystem>
            <TranslationProvider locale={locale} messages={messages}>
              <ToastProvider
                placement="top-right"
                toastProps={{ classNames: { base: "z-9" } }}
                regionProps={{ className: "z-[999]" }}
              />
              <DeviceProvider device={device}>
                <ReactWrapBalancerProvider>{children}</ReactWrapBalancerProvider>
              </DeviceProvider>
            </TranslationProvider>
          </NextThemesProvider>
        </I18nProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
};

export default ApplicationProvider;
