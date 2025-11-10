"use client";

import { useDisclosure } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx";
import { Send } from "lucide-react";
import { type ReactNode, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { search } from "~/applications/Searchbar/Api/search";
import { SearchResultModal } from "~/applications/Searchbar/Ui/SearchResult/SearchResultModal";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <div className="absolute top-1 right-1.5">
      <button
        type="submit"
        color="primary"
        className="bg-primary rounded-full p-2"
        disabled={pending}
        aria-disabled={pending}
        aria-valuetext="Search button"
      >
        <Send />
      </button>
    </div>
  );
};

interface SearchbarProps {
  startContent: ReactNode;
}

export const Searchbar = ({ startContent }: SearchbarProps) => {
  const [state, formAction] = useActionState(search, null);
  const { t } = useLingui();
  const { onOpen } = useDisclosure();

  return (
    <form
      action={async (formData) => {
        formAction(formData);
        onOpen();
      }}
      className="w-full"
    >
      <div className="relative w-full">
        <label>
          <input
            name="search"
            className={clsx("rounded-full bg-default-100 border-none shadow-sm w-full h-12 pl-12 pr-16")}
            placeholder={t`Enter your product name`}
          />
          {!state?.success && state?.errors.fieldErrors.search ? (
            <p aria-live="polite" className="text-danger">
              {state?.errors.fieldErrors.search}
            </p>
          ) : null}
        </label>
        <div className="absolute top-1 left-1.5">{startContent}</div>
        <SubmitButton />
      </div>

      {state?.success && <SearchResultModal search={state.search} />}
    </form>
  );
};
