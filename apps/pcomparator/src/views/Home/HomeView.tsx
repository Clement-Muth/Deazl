"use client";

import { CTASection } from "~/views/Home/components/CTA/CTASection";
import { FeaturesSection } from "~/views/Home/components/Features/FeaturesSection";
import { GridBackground } from "~/views/Home/components/GridBackground";
import { HeroSection } from "~/views/Home/components/Hero/HeroSection";
import { HowItWorksSection } from "~/views/Home/components/HowItWorks/HowItWorksSection";
import { StatsSection } from "~/views/Home/components/Stats/StatsSection";
import { TestimonialsSection } from "~/views/Home/components/Testimonials/TestimonialsSection";

interface HomeViewProps {
  isLoggedIn: boolean;
}

export function HomeView({ isLoggedIn }: HomeViewProps) {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      <div className="flex-1 flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </div>
    </main>
  );
}
