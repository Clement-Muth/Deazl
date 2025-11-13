import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { SettingsAvatar } from "~/applications/Profile/Ui/Settings/Avatar";
import { SettingsDeleteAccount } from "~/applications/Profile/Ui/Settings/DeleteAccount";
import { SettingsDisplayName } from "~/applications/Profile/Ui/Settings/DisplayName";
import { SettingsPhoneNumber } from "~/applications/Profile/Ui/Settings/PhoneNumber";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";

const SettingsPage = async () => {
  const session = await auth();

  return (
    <main className="container flex-col">
      {/* Mobile-first Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">
              <Trans>Back</Trans>
            </span>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              <Trans>Account Settings</Trans>
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                <Trans>Profile Information</Trans>
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                <Trans>Update your profile information and avatar</Trans>
              </p>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <SettingsAvatar defaultValue={session?.user?.image!} />
              <SettingsDisplayName defaultValue={session?.user?.name!} />
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                <Trans>Contact Information</Trans>
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                <Trans>Manage your contact details</Trans>
              </p>
            </div>
            <div className="p-4 md:p-6">
              <SettingsPhoneNumber defaultValue={session?.user?.phone ?? ""} />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-red-200 bg-gradient-to-r from-red-50 to-red-100">
              <h2 className="text-base md:text-lg font-semibold text-red-900">
                <Trans>Danger Zone</Trans>
              </h2>
              <p className="text-xs md:text-sm text-red-700 mt-1">
                <Trans>Irreversible and destructive actions</Trans>
              </p>
            </div>
            <div className="p-4 md:p-6">
              <SettingsDeleteAccount />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default withLinguiPage(SettingsPage);
