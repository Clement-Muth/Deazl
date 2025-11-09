"use client";

import { Trans } from "@lingui/react/macro";
import {} from "lucide-react";
import { NewPriceButton } from "~/applications/Prices/Ui/NewPrice/NewPriceButton";
import { Searchbar } from "~/applications/Searchbar/Ui/Searchbar";
import { CTASection } from "~/views/Home/components/CTA/CTASection";
import { FeaturesSection } from "~/views/Home/components/Features/FeaturesSection";
import { GridBackground } from "~/views/Home/components/GridBackground";
import { HeroSection } from "~/views/Home/components/Hero/HeroSection";
import { HowItWorksSection } from "~/views/Home/components/HowItWorks/HowItWorksSection";
import { StatsSection } from "~/views/Home/components/Stats/StatsSection";
import { TestimonialsSection } from "~/views/Home/components/Testimonials/TestimonialsSection";

interface HomeViewProps {
  isLoggedIn: boolean;
  userName?: string;
}

export function HomeView({ isLoggedIn, userName }: HomeViewProps) {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      {isLoggedIn ? (
        <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 md:py-16 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="font-display mb-3 text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                <Trans>Welcome back, {userName}</Trans>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                <Trans>Let's find the best deals for your shopping!</Trans>
              </p>
            </div>
          </div>
          <div className="w-full md:w-3xl">
            <Searchbar startContent={<NewPriceButton data-new-price-button />} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <HeroSection />
          <FeaturesSection />
          <TestimonialsSection />
          <HowItWorksSection />
          <StatsSection />
          <CTASection />
        </div>
      )}
    </main>
  );
}
