"use client";

import { Trans } from "@lingui/react/macro";
import { LineChart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Hero from "public/static/images/hero.png";
import { Balancer } from "react-wrap-balancer";

import { Button } from "@heroui/react";
import { HomeStats } from "../HomeStats";

export function HeroSection() {
  return (
    <div className="relative isolate min-h-screen flex items-center">
      <div className="relative w-full pt-16">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left column */}
            <div className="max-w-2xl">
              <div className="mb-8">
                {/* Mise à jour du badge de nouveauté */}
                <div className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-1 ring-inset ring-primary-100 dark:ring-primary-800">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
                    <Trans>Totally free and open source</Trans>
                  </div>
                </div>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                <Balancer>
                  <Trans>Compare prices, save smart</Trans>
                </Balancer>
              </h1>

              {/* Mise à jour de la description */}
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                <Balancer>
                  <Trans>
                    Deazl is a 100% free app that helps you save money by comparing product prices. Our user
                    community actively contributes to enriching the database for everyone's benefit.
                  </Trans>
                </Balancer>
              </p>

              {/* Remplacement des stats statiques par le composant dynamique */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
                <HomeStats />
              </dl>

              {/* Ajout d'une section sur le financement participatif */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <Trans>
                    Deazl is an open source project maintained thanks to community contributions. If you enjoy
                    the service, you can support us via{" "}
                    <Link href="/donate" className="text-primary-600 dark:text-primary-400 hover:underline">
                      a donation
                    </Link>
                    .
                  </Trans>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  href="/auth/signin"
                  color="primary"
                  variant="light"
                  size="lg"
                  className="w-full sm:w-auto relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    <Trans>Start for free</Trans>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 transform transition-transform duration-300 group-hover:scale-110" />
                </Button>
                <Button
                  as={Link}
                  href="/about"
                  variant="flat"
                  size="lg"
                  className="w-full sm:w-auto relative overflow-hidden ring-1 ring-gray-900/10 dark:ring-white/10 hover:ring-gray-900/20 dark:hover:ring-white/20"
                >
                  <Trans>Learn more</Trans>
                </Button>
              </div>
            </div>

            {/* Right column */}
            <div className="relative lg:mt-8">
              <div className="relative">
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary-50 dark:bg-primary-900/50 rounded-full mix-blend-multiply dark:mix-blend-overlay blur-xl animate-blob" />
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-primary-100 dark:bg-primary-800/50 rounded-full mix-blend-multiply dark:mix-blend-overlay blur-xl animate-blob animation-delay-2000" />

                <div className="relative over rounded-2xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 via-primary-50/0 to-primary-100 dark:from-primary-900 dark:via-primary-900/0 dark:to-primary-900 rounded-2xl" />
                  <Image
                    src={Hero}
                    alt="Deazl interface example"
                    className="relative rounded-2xl shadow-xl"
                    priority
                  />
                </div>

                {/* Floating badges */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
                      <ShoppingCart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        <Trans>Savings</Trans>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">+15% on average</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1/4 -right-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
                      <LineChart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        <Trans>Tracked prices</Trans>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">10k+ products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
