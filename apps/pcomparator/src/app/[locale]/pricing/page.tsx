"use client";

import { Trans } from "@lingui/react/macro";
import { BarChart2, Check, Github, Heart, LineChart, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";
import { GridBackground } from "~/views/Home/components/GridBackground";

const features = [
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Unlimited price comparison",
    description: "Compare prices between different stores in real time"
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Detailed price history",
    description: "Track price changes over time"
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Smart shopping lists",
    description: "Create and share your lists, with cost estimation"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaboration and sharing",
    description: "Share your lists and collaborate in real time"
  }
];

const benefits = [
  "Barcode scanner",
  "Data export",
  "Community support",
  "No usage limits",
  "Regular updates",
  "Open source code"
];

export default function PricingPage() {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      {/* Hero Section */}
      <div className="relative isolate min-h-screen flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 mb-6 dark:bg-primary-900/50">
              <span className="inline-block animate-pulse rounded-full h-2 w-2 bg-primary-600 dark:bg-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>Community project</Trans>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              <Balancer>
                <Trans>100% Free and Open Source</Trans>
              </Balancer>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <Balancer>
                <Trans>
                  Deazl is a completely free app, developed with and for the community. No subscription, no
                  hidden features – everything is accessible to everyone.
                </Trans>
              </Balancer>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative pb-16 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:20px_20px] dark:bg-grid-white/[0.01]" />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-gray-950 dark:via-gray-950/95 dark:to-gray-950/90" />
        <div className="relative max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-gray-900 rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-grid-primary-600/[0.03] bg-[size:16px_16px] dark:bg-grid-white/[0.02] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-transparent dark:from-gray-950/50 dark:via-gray-950/30 dark:to-transparent" />
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Trans>Everything included, for everyone</Trans>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  <Trans>
                    Our mission is to make price comparison accessible to everyone. That's why we don't limit
                    any features.
                  </Trans>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4"
                  >
                    <Check className="h-5 w-5 flex-none text-primary-600 dark:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signin"
                  className="group relative inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium bg-primary-600 text-white hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 transition-colors duration-300"
                >
                  <Trans>Start for free</Trans>
                </Link>
                <Link
                  href="https://github.com/yourusername/pcomparator"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                >
                  <Github className="w-5 h-5" />
                  <Trans>View on GitHub</Trans>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:24px_24px] rotate-3 dark:bg-grid-white/[0.01]" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/95 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-950" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-50/80 backdrop-blur-sm dark:bg-primary-900/50">
              <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>Supported by the community</Trans>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <Trans>Frequently Asked Questions</Trans>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: <Trans>How is the app maintained?</Trans>,
                description: (
                  <Trans>
                    Deazl is an open source project maintained by the community. The code is public and anyone
                    can contribute to its improvement.
                  </Trans>
                ),
                key: "maintained"
              },
              {
                title: <Trans>How can I support the project?</Trans>,
                description: (
                  <Trans>
                    You can support Deazl by contributing code, reporting bugs, suggesting improvements, or
                    making a donation to help cover hosting costs.
                  </Trans>
                ),
                key: "support"
              },
              {
                title: <Trans>Are there any usage limits?</Trans>,
                description: (
                  <Trans>
                    No, all features are available without limits. We simply ask you to use the app
                    responsibly and contribute to the community.
                  </Trans>
                ),
                key: "limits"
              },
              {
                title: <Trans>How can I get help?</Trans>,
                description: (
                  <Trans>
                    We have an active community ready to help you. You can ask your questions on our forum or
                    consult our detailed documentation.
                  </Trans>
                ),
                key: "help"
              }
            ].map((faq) => (
              <div
                key={faq.key}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold mb-3">{faq.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
