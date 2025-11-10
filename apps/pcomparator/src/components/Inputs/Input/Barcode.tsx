"use client";

import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Barcode as BarcodeIcon } from "lucide-react";
import { Input, type InputProps } from "~/components/Inputs/Input/Input";

export const Barcode = (props: InputProps) => {
  const { i18n } = useLingui();

  return (
    <Input
      placeholder="8690804407383"
      label={<Trans>Barcode</Trans>}
      startContent={<BarcodeIcon />}
      description={i18n._("All barcode types are accepted.")}
      required={i18n._("Please enter a valid barcode.")}
      {...props}
    />
  );
};
