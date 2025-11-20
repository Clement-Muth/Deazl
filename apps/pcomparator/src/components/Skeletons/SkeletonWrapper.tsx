"use client";

import clsx from "clsx";
import type React from "react";

export function SkeletonWrapper({
  loading,
  children
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div aria-hidden={loading} className={clsx({ skeleton: loading }, "w-full")}>
      {children}
    </div>
  );
}
