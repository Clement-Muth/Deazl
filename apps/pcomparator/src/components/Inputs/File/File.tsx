import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Input, type InputProps as InputPropsNextUi } from "@heroui/input";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx";
import { useState } from "react";
import { Controller, type FieldValues, type RegisterOptions, useFormContext } from "react-hook-form";
import FormError from "~/components/Form/FormError";
import { FileNames } from "~/components/Inputs/File/FileNames";
import { useFileHandler } from "~/components/Inputs/File/useFileHandler";

export interface FileProps extends Omit<InputPropsNextUi, keyof RegisterOptions<FieldValues, any>> {
  name: string;
  maxSize?: number | "unlimited";
  maxFile?: number | "unlimited";
  minFile?: number;
  onFileLoaded?: (urls: string[]) => void;
  disablePreview?: boolean;
  disableFileName?: boolean;
  required?: string;
}

export const File = ({
  name,
  maxSize = "unlimited",
  maxFile = "unlimited",
  minFile = 0,
  onFileLoaded,
  disablePreview,
  disableFileName,
  deps,
  max,
  maxLength,
  min,
  minLength,
  onBlur,
  onChange,
  pattern,
  required,
  shouldUnregister,
  validate,
  value,
  ...props
}: FileProps & RegisterOptions<FieldValues, any>) => {
  const form = useFormContext();
  const { t } = useLingui();
  // biome-ignore format: keep one line
  const rules = {deps, max, maxLength, min, minLength, onBlur, onChange, pattern, required: required ? {message: required as string, value: true} : undefined, shouldUnregister, validate, value};
  const [dragging, setDragging] = useState<boolean>(false);
  const { filePreviews, onChangeFile, handleDeleteFile } = useFileHandler(
    maxSize,
    maxFile,
    minFile,
    onFileLoaded,
    () => form.clearErrors(name),
    (message) => form.setError(name, { message }),
    !!props.multiple
  );

  return (
    <div className="w-full">
      <Controller
        control={form.control}
        name={name}
        rules={rules}
        defaultValue=""
        render={({ field: { value, ...field }, fieldState }) => {
          return (
            <div>
              <label
                htmlFor="inner-file-input"
                onDrop={(e) => {
                  e.preventDefault();
                  onChangeFile(e, field);
                  setDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
              >
                <Input
                  readOnly
                  size="lg"
                  radius="sm"
                  labelPlacement="outside"
                  placeholder={
                    dragging
                      ? t`Drag and drop your file`
                      : value?.length
                        ? Array.from(value as FileList)
                            .map((v) => v.name)
                            .join()
                        : t`Select your file`
                  }
                  classNames={{
                    label: "text-black-primary text-sm",
                    input: "pointer-events-none",
                    inputWrapper: clsx("!cursor-pointer", { "border border-dashed": dragging }),
                    innerWrapper: "!cursor-pointer"
                  }}
                  isRequired={!!required}
                  isInvalid={
                    (fieldState.error?.message ?? props.errorMessage ?? fieldState.invalid ?? props.isInvalid)
                      ? true
                      : undefined
                  }
                  errorMessage={fieldState.error?.message ? <p>{fieldState.error.message}</p> : null}
                  {...(props as InputPropsNextUi)}
                />
              </label>
              {!disableFileName ? (
                <FileNames
                  files={Array.from(value)}
                  onClick={(fileList, i) => {
                    try {
                      handleDeleteFile(Array.from(fileList), i, (files) => field.onChange(files));
                    } catch (err) {
                      if (err instanceof FormError)
                        form.setError(name, { message: err.message, type: "min" });
                      else console.error(err);
                    }
                  }}
                />
              ) : null}
              <input
                id="inner-file-input"
                hidden
                multiple={props.multiple}
                accept={props.accept}
                disabled={props.isDisabled}
                {...field}
                onChange={(e) => {
                  onChangeFile(e, field);
                }}
                type="file"
              />
            </div>
          );
        }}
      />
      {!disablePreview ? (
        <div className="w-fit mt-2 ml-2">
          <AvatarGroup isBordered>
            {filePreviews
              ? filePreviews.map((preview, i) => (
                  <Avatar src={preview} size="md" alt="avatar preview" key={`preview-${i}`} />
                ))
              : null}
          </AvatarGroup>
        </div>
      ) : null}
    </div>
  );
};
