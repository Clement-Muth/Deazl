import type { ReactNode } from "react";
import ApplicationProvider from "~/core/ApplicationProvider";
import type { AVAILABLE_LOCALES } from "~/core/locale";
import { allMessages } from "~/translations/i18n";

interface ApplicationKernelProps {
  children: ReactNode;
  locale: AVAILABLE_LOCALES;
}

const ApplicationKernel = async ({ children, locale }: ApplicationKernelProps) => {
  // const device = await getDevice();

  return (
    <ApplicationProvider locale={locale} messages={allMessages[locale]} device="mobile">
      {children}
    </ApplicationProvider>
  );
};

export default ApplicationKernel;
