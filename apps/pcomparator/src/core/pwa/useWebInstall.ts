"use client";

import { useEffect, useState } from "react";
import useShouldShowPrompt from "~/core/pwa/useShouldShow";

const webInstallPromptedAt = "webInstallPromptedAt";

const useWebInstallPrompt = (): [any, () => void, () => void] => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [userShouldBePromptedToInstall, handleUserSeeingInstallPrompt] =
    useShouldShowPrompt(webInstallPromptedAt);

  useEffect(() => {
    const beforeInstallPromptHandler = (event: any) => {
      event.preventDefault();

      if (userShouldBePromptedToInstall) {
        setInstallPromptEvent(event);
      }
    };
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    return () => window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
  }, [userShouldBePromptedToInstall]);

  const handleInstallDeclined = () => {
    handleUserSeeingInstallPrompt();
    setInstallPromptEvent(null);
  };

  const handleInstallAccepted = () => {
    installPromptEvent.prompt();

    installPromptEvent.userChoice.then((choice: any) => {
      if (choice.outcome !== "accepted") {
        handleUserSeeingInstallPrompt();
      }
      setInstallPromptEvent(null);
    });
  };
  return [installPromptEvent, handleInstallDeclined, handleInstallAccepted];
};
export default useWebInstallPrompt;
