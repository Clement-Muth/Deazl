"use client";

import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Controller, type FieldValues, type RegisterOptions, useFormContext } from "react-hook-form";
import PhoneInput, {
  type DefaultInputComponentProps,
  type FeatureProps,
  isValidPhoneNumber
} from "react-phone-number-input";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";

export interface PhoneProps
  extends FeatureProps<DefaultInputComponentProps>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof FeatureProps<DefaultInputComponentProps> | keyof RegisterOptions<FieldValues, any>
    > {
  name: string;
  label?: ReactNode;
}

export default ({
  name,
  label,
  defaultValue = "",
  ...props
}: PhoneProps & RegisterOptions<FieldValues, any>) => {
  const form = useFormContext();
  // biome-ignore format: keep one line
  const {deps, max, maxLength, min, minLength, onBlur, onChange, pattern, required, shouldUnregister, validate, value} = props;
  // biome-ignore format: keep one line
  const rules = {deps, max, maxLength, min, minLength, onBlur, onChange, pattern, required: required ? {message: required as string, value: true} : undefined, shouldUnregister, validate, value};
  const { i18n } = useLingui();

  return (
    <Controller
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      rules={{ ...rules, validate: form.getValues()[name] ? isValidPhoneNumber : undefined }}
      render={({ field, fieldState: { invalid, error } }) => (
        <div className="flex flex-col gap-2 w-full" data-number-code-form>
          {label ? (
            <label
              htmlFor={name}
              className={clsx(
                !!required && "after:content-['*'] after:text-danger after:ml-0.5",
                "block text-small text-left whitespace-nowrap mb-2 text-wrap",
                invalid ? "text-danger" : "text-black-primary"
              )}
            >
              {label}
            </label>
          ) : null}
          <PhoneInput
            placeholder={t`Enter your phone number`}
            defaultCountry="FR"
            country="FR"
            {...props}
            {...field}
            name={name}
            id={name}
            onChange={(e) => field.onChange(e === undefined ? "" : e)}
            className={clsx(
              "w-full space-x-3",
              props.className,
              invalid ? "!bg-danger-50 hover:!bg-danger-100 active:!bg-danger-50" : "bg-[#e5e7eb]"
            )}
          />
          <ErrorMessage
            error={
              error?.type === "isValidPhoneNumber" || error?.type === "validate" ? (
                <Trans>Your phone number is not valid</Trans>
              ) : (
                error?.message
              )
            }
          />
        </div>
      )}
    />
  );
};
