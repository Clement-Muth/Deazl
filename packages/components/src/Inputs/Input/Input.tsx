import { Input as InputNextUi, type InputProps as InputPropsNextUi } from "@heroui/input";
import { Controller, type FieldValues, type RegisterOptions, useFormContext } from "react-hook-form";

export interface InputProps extends Omit<InputPropsNextUi, keyof RegisterOptions<FieldValues, any>> {
  name: string;
  required?: string;
}

export const Input = ({
  name,
  defaultValue = "",
  required,
  deps,
  max,
  maxLength,
  min,
  minLength,
  onBlur,
  onChange,
  pattern,
  shouldUnregister,
  validate,
  value = undefined,
  ...props
}: InputProps & RegisterOptions<FieldValues, any>) => {
  const form = useFormContext();
  // biome-ignore format: keep one line
  const rules = {deps, max, maxLength, min, minLength, onBlur, onChange, pattern, required: required ? {message: required, value: true} : undefined, shouldUnregister, validate, value};

  return (
    <Controller
      control={form.control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <InputNextUi
          {...field}
          size="lg"
          radius="sm"
          classNames={{ label: "text-black-primary text-sm", input: "text-small md:text-base" }}
          labelPlacement="outside"
          isRequired={!!required}
          isDisabled={props.disabled}
          isInvalid={
            (fieldState.error?.message ?? props.errorMessage ?? fieldState.invalid ?? props.isInvalid)
              ? true
              : undefined
          }
          errorMessage={fieldState.error?.message ? <p>{fieldState.error.message}</p> : null}
          {...(props as InputPropsNextUi)}
          onChange={(e) => {
            field.onChange(e);
          }}
          defaultValue={defaultValue}
          value={value}
        />
      )}
    />
  );
};
