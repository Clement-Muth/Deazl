"use client";

import { Trans } from "@lingui/react/macro";

interface StepCardProps {
  step: string;
  title: React.ReactNode;
  description: React.ReactNode;
  isLast?: boolean;
}

function StepCard({ step, title, description, isLast }: StepCardProps) {
  return (
    <div className="group relative flex flex-col items-center text-center p-6">
      {!isLast && (
        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-primary-400 dark:from-primary-800 dark:to-primary-600 transform translate-y-6" />
      )}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-2xl">
            {step}
          </div>
        </div>
      </div>
      <h3 className="text-xl font-semibold mt-6 mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <div className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6">
          <Trans>How does it work?</Trans>
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-16">
          <Trans>Start saving in just a few simple steps. No more running around different stores!</Trans>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StepCard
            step="1"
            title={<Trans>Sign up</Trans>}
            description={<Trans>Create your free account in seconds</Trans>}
          />
          <StepCard
            step="2"
            title={<Trans>Create your lists</Trans>}
            description={<Trans>Add the products you want to track</Trans>}
          />
          <StepCard
            step="3"
            title={<Trans>Compare prices</Trans>}
            description={<Trans>Find the best prices near you</Trans>}
          />
          <StepCard
            step="4"
            title={<Trans>Save money</Trans>}
            description={<Trans>Shop at the best prices</Trans>}
            isLast
          />
        </div>
      </div>
    </div>
  );
}
