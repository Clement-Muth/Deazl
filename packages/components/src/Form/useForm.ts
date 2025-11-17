import { type FormEvent, useCallback, useEffect } from "react";
import { type FieldValues, type UseFormProps, useForm as useHookForm } from "react-hook-form";
import Form from "./Form";

export type ClearError = <T extends FieldValues>(e: FormEvent<T>) => void;

export type UseFormReturn<T extends FieldValues> = ReturnType<typeof useForm<T>>;

function useForm<T extends FieldValues>(focus?: keyof T, config?: UseFormProps<T, any>) {
  const form = useHookForm<T>({
    reValidateMode: "onChange",
    mode: "onSubmit",
    criteriaMode: "firstError",
    shouldFocusError: true,
    shouldUnregister: true,
    ...config
  });

  const clearError = useCallback((e?: { target: { name: string } }) => {
    form.clearErrors();
  }, []);

  useEffect(() => {
    form.setFocus(focus as any);
  }, [form.setFocus]);

  return {
    ...form,
    Form: Form<T>,
    register: form.register,
    errors: form.formState.errors,
    isError: Object.keys(form.formState.errors)
      .filter((key) => form.formState.errors[key])
      .some((v) => v),
    clearError,
    value: form.watch,
    methods: form,
    setError: form.setError,
    asChanged: form.formState.isDirty
  };
}

export default useForm;
