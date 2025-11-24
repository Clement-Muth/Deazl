import { Alert } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Info } from "lucide-react";

interface ModeToggleHelpProps {
  type: "ingredients" | "steps";
  isGroupMode: boolean;
}

export const ModeToggleHelp = ({ type, isGroupMode }: ModeToggleHelpProps) => {
  if (!isGroupMode) return null;

  return (
    <Alert color="primary" variant="flat" className="mb-4" startContent={<Info className="w-5 h-5" />}>
      {type === "ingredients" ? (
        <div className="text-sm">
          <p className="font-medium mb-1">
            <Trans>Organized Mode</Trans>
          </p>
          <p className="text-default-600">
            <Trans>
              Group your ingredients by category (e.g., "Dough", "Filling", "Sauce") for better readability.
            </Trans>
          </p>
        </div>
      ) : (
        <div className="text-sm">
          <p className="font-medium mb-1">
            <Trans>Organized Mode</Trans>
          </p>
          <p className="text-default-600">
            <Trans>
              Group your steps by phase (e.g., "Preparation", "Cooking", "Assembly") to structure your recipe.
            </Trans>
          </p>
        </div>
      )}
    </Alert>
  );
};
