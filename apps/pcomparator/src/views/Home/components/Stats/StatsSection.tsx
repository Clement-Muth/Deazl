"use client";

import { Trans } from "@lingui/react/macro";
import { BarChart2, ShoppingBag, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";

export function StatsSection() {
  const [stats, setStats] = useState<any>({
    productsCount: 0,
    usersCount: 0,
    storesCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  };

  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-4">
      <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:20px_20px] dark:bg-grid-white/[0.01]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-gray-950 dark:via-gray-950/95 dark:to-gray-950/90" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-50/80 backdrop-blur-sm dark:bg-primary-900/50">
            <BarChart2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              <Trans>Statistics</Trans>
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            <Trans>Deazl in numbers</Trans>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            <Trans>A growing community that contributes every day to enrich our database.</Trans>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-transparent dark:from-primary-400/5" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Trans>Average savings</Trans>
              </dt>
              <dd className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                15%
              </dd>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-transparent dark:from-primary-400/5" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                <BarChart2 className="w-6 h-6" />
              </div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Trans>Referenced products</Trans>
              </dt>
              <dd className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {formatNumber(stats.productsCount)}
              </dd>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-transparent dark:from-primary-400/5" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Trans>Active users</Trans>
              </dt>
              <dd className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {formatNumber(stats.usersCount)}
              </dd>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-transparent dark:from-primary-400/5" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-6 h-6" />
              </div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Trans>Partner stores</Trans>
              </dt>
              <dd className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {formatNumber(stats.storesCount)}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
