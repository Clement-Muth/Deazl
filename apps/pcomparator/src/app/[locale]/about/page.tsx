"use client";

import { Trans } from "@lingui/react/macro";
import { Building2, Github, Heart, Target, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LogoImage from "public/static/logo.png";
import { Balancer } from "react-wrap-balancer";
import { GridBackground } from "~/views/Home/components/GridBackground";

export default function AboutPage() {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      {/* Hero section with animated grid */}
      <div className="relative isolate min-h-screen flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Image
              src={LogoImage}
              alt="Deazl Logo"
              width={96}
              height={96}
              className="mx-auto mb-8 p-4 rounded-3xl shadow-xl bg-white hover:scale-105 transition-transform duration-300"
            />
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 mb-6 dark:bg-primary-900/50">
              <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>For the community</Trans>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              <Balancer>
                <Trans>Our mission</Trans>
              </Balancer>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <Balancer>
                <Trans>
                  Deazl was born from a simple conviction: everyone should be able to shop at the best price
                  without spending hours comparing stores.
                </Trans>
              </Balancer>
            </p>
          </div>
        </div>
      </div>

      {/* Mission and values with rotated grid */}
      <div className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:24px_24px] rotate-3 dark:bg-grid-white/[0.01]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-gray-950 dark:via-gray-950/95 dark:to-gray-950/90" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <h2 className="text-3xl font-bold mb-6">
                <Trans>Our story</Trans>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <Trans>
                  Founded in 2024, Deazl is the result of a collaboration between technology enthusiasts and
                  consumers frustrated by the lack of price transparency in retail.
                </Trans>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <Trans>
                  Our community-based approach helps maintain an up-to-date database of prices across
                  different stores, helping everyone make informed choices for their shopping.
                </Trans>
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <h2 className="text-3xl font-bold mb-6">
                <Trans>Our vision</Trans>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <Trans>
                  We envision a future where price comparison is accessible to all, where shopping at the best
                  price becomes simple and intuitive.
                </Trans>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <Trans>
                  Our goal is to become the reference for price comparison for everyday products, while
                  building an engaged and supportive community.
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values with grid and gradient */}
      <div className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:20px_20px] dark:bg-grid-white/[0.01]" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/95 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-950" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <Trans>Our values</Trans>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: <Trans>Community</Trans>,
                description: <Trans>Together, we build a collaborative and reliable database.</Trans>,
                key: "community"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: <Trans>Transparency</Trans>,
                description: <Trans>Clear and verified information for informed choices.</Trans>,
                key: "transparency"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: <Trans>Excellence</Trans>,
                description: <Trans>Continuous improvement of our services and data.</Trans>,
                key: "excellence"
              },
              {
                icon: <Building2 className="w-8 h-8" />,
                title: <Trans>Innovation</Trans>,
                description: <Trans>Technology at the service of your purchasing power.</Trans>,
                key: "innovation"
              }
            ].map((value) => (
              <div
                key={value.key}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 text-primary-600 dark:text-primary-400">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team with call-to-action */}
      <div className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary-600/[0.03] bg-[size:16px_16px] -rotate-3 dark:bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/95 to-white dark:from-primary-950 dark:via-primary-950/95 dark:to-gray-950" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-100/80 backdrop-blur-sm dark:bg-primary-900/50">
            <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              <Trans>Join the adventure</Trans>
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <Trans>The team</Trans>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            <Balancer>
              <Trans>
                A passionate team of developers, designers, and data experts dedicated to helping you save on
                your shopping.
              </Trans>
            </Balancer>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="group relative inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium bg-primary-600 text-white hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 transition-colors duration-300"
            >
              <Trans>Join the community</Trans>
            </Link>
            <Link
              href="https://github.com/yourusername/pcomparator"
              className="group inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors duration-300"
            >
              <Github className="w-5 h-5" />
              <Trans>Contribute on GitHub</Trans>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
