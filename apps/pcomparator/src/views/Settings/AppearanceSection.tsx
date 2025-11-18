"use client";

import { Trans } from "@lingui/react/macro";
import { SettingsTheme } from "~/applications/Profile/Ui/Settings/Theme";

export const AppearanceSection = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-linear-to-r from-purple-50 to-purple-100">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          <Trans>Appearance</Trans>
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          <Trans>Customize the look and feel</Trans>
        </p>
      </div>
      <div className="p-4 md:p-6">
        <SettingsTheme />
      </div>
    </div>
  );
};
