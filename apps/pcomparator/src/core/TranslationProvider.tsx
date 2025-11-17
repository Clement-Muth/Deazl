"use client";

import { setupI18n } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import { useState } from "react";

type Props = {
  locale: string;
  messages?: any;
  children: React.ReactNode;
};

const TranslationProvider = ({ locale, messages, ...props }: Props) => {
  const [i18n] = useState(() => {
    return setupI18n({
      locale: locale,
      messages: { [locale]: messages }
    });
  });

  return <LinguiProvider i18n={i18n} {...props} />;
};

export default TranslationProvider;
