"use client";

import dynamic from "next/dynamic";
import { Bounce, ToastContainer } from "react-toastify";
import { useTheme } from "~/hooks/useTheme";

const ToastComponent = () => {
  const { activeTheme } = useTheme();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      closeButton={false}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={activeTheme}
      transition={Bounce}
      className="rounded-lg"
      stacked
    />
  );
};

export const Toast = dynamic(() => Promise.resolve(ToastComponent), {
  ssr: false
});
