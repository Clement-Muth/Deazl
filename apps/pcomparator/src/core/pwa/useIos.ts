import useShouldShowPrompt from "~/core/pwa/useShouldShow";

const iosInstallPromptedAt = "iosInstallPromptedAt";

const isIOS = (): boolean => {
  // @ts-ignore
  if (navigator.standalone) {
    //user has already installed the app
    return false;
  }
  const ua = window.navigator.userAgent;
  const isIPad = !!ua.match(/iPad/i);
  const isIPhone = !!ua.match(/iPhone/i);
  return isIPad || isIPhone;
};

const useIosInstallPrompt = (): [boolean, () => void] => {
  const [userShouldBePromptedToInstall, handleUserSeeingInstallPrompt] =
    useShouldShowPrompt(iosInstallPromptedAt);

  return [isIOS() && userShouldBePromptedToInstall, handleUserSeeingInstallPrompt];
};
export default useIosInstallPrompt;
