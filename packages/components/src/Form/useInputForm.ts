import { type FormEvent, useMemo } from "react";
import type { FieldErrors, FieldPath, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";

export type Input<T extends FieldValues> = {
  id: FieldPath<T>;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  value?: string;
  inputOptions: RegisterOptions<T, FieldPath<T>> | undefined;
};

export type ClearError = (e: FormEvent) => void;

const useInputForm = <T extends FieldValues>(
  inputs: Input<T>[],
  register: UseFormRegister<T>,
  clearError: ClearError,
  errors: FieldErrors<T>
) => {
  return useMemo(() => {
    return inputs?.map(({ id, inputOptions, ...options }) => ({
      ...options,
      error: errors[id]?.message,
      ref: register(id, { onChange: clearError, ...inputOptions })
    }));
  }, [Object.keys(errors)]);
};

export default useInputForm;
