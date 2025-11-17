"use client";

import { type ReactNode, createContext, useEffect, useState } from "react";
import useMediaQuery, { MediaQuery } from "./hooks/useMediaQuery";

export type Device = "mobile" | "desktop";

export const DeviceContext = createContext<Device>("desktop");

interface DeviceProviderProps {
  device: Device;
  children: ReactNode;
}

export const DeviceProvider = ({ device, children }: DeviceProviderProps) => {
  const [computedDevice, setComputedDevice] = useState<Device>(device);
  const isMobile = useMediaQuery(MediaQuery.md);

  useEffect(() => {
    if (
      isMobile === undefined ||
      (computedDevice === "mobile" && isMobile) ||
      (computedDevice === "desktop" && !isMobile)
    )
      return;
    setComputedDevice(isMobile ? "mobile" : "desktop");
  }, [isMobile]);

  return <DeviceContext.Provider value={computedDevice}>{children}</DeviceContext.Provider>;
};
