"use client";

import { Trans } from "@lingui/react/macro";
import { CheckCircle2, Clock, Globe2, Heart, Users } from "lucide-react";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";
import { GridBackground } from "~/views/Home/components/GridBackground";

export default function FeaturesPage() {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>

      {/* Hero section */}
      <div className="relative isolate min-h-screen flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 mb-6 dark:bg-primary-900/50">
              <span className="inline-block animate-pulse rounded-full h-2 w-2 bg-primary-600 dark:bg-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>All our features</Trans>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              <Balancer>
                <Trans>Simple and powerful tools</Trans>
              </Balancer>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <Balancer>
                <Trans>
                  Discover all the tools at your disposal to manage your shopping and save money every day.
                </Trans>
              </Balancer>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <Trans>Real-time price comparison</Trans>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <Trans>Compare prices between different stores</Trans>
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <Trans>Collaborative lists</Trans>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <Trans>Create and share your lists in real time</Trans>
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <Trans>History and analytics</Trans>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <Trans>Track and analyze your expenses</Trans>
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <Trans>Store network</Trans>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <Trans>A wide coverage of stores</Trans>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features détaillées */}
      <div className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:24px_24px] rotate-3 dark:bg-grid-white/[0.01]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-gray-950 dark:via-gray-950/95 dark:to-gray-950/90" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-100/80 backdrop-blur-sm dark:bg-primary-900/50">
              <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>In detail</Trans>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <Trans>Essential features</Trans>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature cards */}
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-900/90">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <CheckCircle2 className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                <Trans>Real-time price comparison</Trans>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <Trans>
                  Instantly compare prices between different stores. Our database is updated daily by our
                  active community.
                </Trans>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Prices verified by the community</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>30-day price history</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Price drop alerts</Trans>
                  </span>
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-900/90">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Users className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                <Trans>Collaborative shopping lists</Trans>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <Trans>
                  Create and share your shopping lists with your family or friends. Collaborate in real time
                  for optimal organization.
                </Trans>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Easy sharing with loved ones</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Real-time updates</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Smart product suggestions</Trans>
                  </span>
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-900/90">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Clock className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                <Trans>History and analytics</Trans>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <Trans>
                  Track your expenses and analyze your shopping habits to optimize your grocery budget.
                </Trans>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Detailed price charts</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Analysis of savings made</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Consumption trends</Trans>
                  </span>
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-900/90">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Globe2 className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                <Trans>Store network</Trans>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <Trans>
                  Access prices from many stores near you. Our network grows every day thanks to the
                  community.
                </Trans>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>National coverage</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Major chains and local stores</Trans>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <Trans>Store geolocation</Trans>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.03] bg-[size:16px_16px] -rotate-3 dark:bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/95 to-white dark:from-primary-950 dark:via-primary-950/95 dark:to-gray-950" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <Trans>Ready to save on your groceries?</Trans>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            <Trans>Join our community and start enjoying all our features for free.</Trans>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="group relative inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium bg-primary-600 text-white hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 transition-colors duration-300"
            >
              <Trans>Start now</Trans>
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors duration-300"
            >
              <Trans>Contact us</Trans>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
