import { headers } from "next/headers";
import type { Device } from "~/types/device";

export const getDevice = async () => {
  return (await headers()).get("x-device") as Device;
};
