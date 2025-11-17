import { useContext } from "react";
import { DeviceContext } from "../DeviceProvider";

const useDevice = () => useContext(DeviceContext);

export default useDevice;
