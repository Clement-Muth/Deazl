"use client";

import { type ReactNode, createContext, useEffect, useState } from "react";
import useMediaQuery, { MediaQuery } from "~/hooks/useMediaQuery";
import type { Device } from "~/types/device";

export const DeviceContext = createContext<Device>("desktop");

interface DeviceProviderProps {
  device: Device;
  children: ReactNode;
}

const DeviceProvider = ({ device, children }: DeviceProviderProps) => {
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

export default DeviceProvider;
