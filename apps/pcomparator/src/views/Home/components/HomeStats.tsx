"use client";

import { Trans } from "@lingui/react/macro";
import { useEffect, useState } from "react";

interface StatsData {
  productsCount: number;
  usersCount: number;
  storesCount: number;
}

export const HomeStats = () => {
  const [stats, setStats] = useState<StatsData>({
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
    <>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
          <Trans>Average savings</Trans>
        </dt>
        <dd className="text-2xl font-semibold tracking-tight text-primary-600 dark:text-primary-400">15%</dd>
      </div>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
          <Trans>Referenced products</Trans>
        </dt>
        <dd className="text-2xl font-semibold tracking-tight text-primary-600 dark:text-primary-400">
          {formatNumber(stats.productsCount)}
        </dd>
      </div>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
          <Trans>Active users</Trans>
        </dt>
        <dd className="text-2xl font-semibold tracking-tight text-primary-600 dark:text-primary-400">
          {formatNumber(stats.usersCount)}
        </dd>
      </div>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-gray-900/10 dark:ring-white/10">
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
          <Trans>Partner stores</Trans>
        </dt>
        <dd className="text-2xl font-semibold tracking-tight text-primary-600 dark:text-primary-400">
          {formatNumber(stats.storesCount)}
        </dd>
      </div>
    </>
  );
};
