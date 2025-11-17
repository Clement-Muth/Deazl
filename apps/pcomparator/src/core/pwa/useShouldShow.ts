import moment from "moment";
import { useState } from "react";

const getInstallPromptLastSeenAt = (promptName: string): string => localStorage.getItem(promptName)!;

const setInstallPromptSeenToday = (promptName: string): void => {
  const today = moment().toISOString();
  localStorage.setItem(promptName, today);
};

function getUserShouldBePromptedToInstall(
  promptName: string,
  daysToWaitBeforePromptingAgain: number
): boolean {
  const lastPrompt = moment(getInstallPromptLastSeenAt(promptName));
  const daysSinceLastPrompt = moment().diff(lastPrompt, "days");
  return Number.isNaN(daysSinceLastPrompt) || daysSinceLastPrompt > daysToWaitBeforePromptingAgain;
}

const useShouldShowPrompt = (
  promptName: string,
  daysToWaitBeforePromptingAgain = 30
): [boolean, () => void] => {
  const [userShouldBePromptedToInstall, setUserShouldBePromptedToInstall] = useState(
    getUserShouldBePromptedToInstall(promptName, daysToWaitBeforePromptingAgain)
  );

  const handleUserSeeingInstallPrompt = () => {
    setUserShouldBePromptedToInstall(false);
    setInstallPromptSeenToday(promptName);
  };

  return [userShouldBePromptedToInstall, handleUserSeeingInstallPrompt];
};
export default useShouldShowPrompt;
