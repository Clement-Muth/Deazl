import { useContext } from "react";
import { DeviceContext } from "~/core/DeviceProvider";

const useDevice = () => useContext(DeviceContext);

export default useDevice;
