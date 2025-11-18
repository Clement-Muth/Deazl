"use client";

import { AppearanceSection } from "./AppearanceSection";
import { ContactSection } from "./ContactSection";
import { DangerZoneSection } from "./DangerZoneSection";
import { ProfileSection } from "./ProfileSection";
import { ShoppingOptimizationSection } from "./ShoppingOptimizationSection";

interface SettingsPageProps {
  userImage?: string;
  userName?: string;
  phoneNumber?: string;
  userId: string;
}

export const SettingsPage = ({ userImage, userName, phoneNumber, userId }: SettingsPageProps) => {
  return (
    <main className="container flex-col">
      {/* Mobile-first Header with Back Button */}
      <div className="flex items-center gap-4 p-4 md:p-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="space-y-4 md:space-y-6">
          <ProfileSection userImage={userImage} userName={userName} />
          <AppearanceSection />
          <ContactSection phoneNumber={phoneNumber} />
          <ShoppingOptimizationSection userId={userId} />
          <DangerZoneSection />
        </div>
      </div>
    </main>
  );
};
