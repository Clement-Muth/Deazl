import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { type ChangeEvent, type DragEvent, useCallback, useState } from "react";
import FormError from "../..//Form/FormError";

class Byte {
  public readonly size: number;

  constructor(
    public readonly file: File,
    public readonly maxSize: number | "unlimited"
  ) {
    this.file = file;
    this.size = file.size / 1048576;

    if (this.maxSize !== "unlimited" && this.size > this.maxSize)
      throw new FormError("", "", `Your file exceeded the limit ${this.maxSize}Mo`);
  }
}

export const useFileHandler = (
  maxSize: number | "unlimited",
  maxFile: number | "unlimited",
  minFile: number,
  onFileLoaded: ((urls: string[]) => void) | undefined,
  clearErrors: () => void,
  onError: (message: string) => void,
  isMultiple: boolean
) => {
  const { i18n } = useLingui();
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const onChangeFile = useCallback(
    (e: ChangeEvent<HTMLInputElement> | DragEvent<HTMLLabelElement>, field: any) => {
      try {
        const files =
          (e as ChangeEvent<HTMLInputElement>).target.files ??
          (e as DragEvent<HTMLLabelElement>).dataTransfer.files;

        clearErrors();
        if (!files?.length) return;

        handleFilesChange(Array.from(files));
        field.onChange(isMultiple ? files : files.item(0));
      } catch (err) {
        if (err instanceof FormError) onError(err.message);
        else console.error(err);
      }
    },
    []
  );

  const validateFiles = (files: File[]) => {
    if (minFile && files.length < minFile)
      throw new FormError("", "", t`You must add more than ${minFile} files`);
    if (maxFile && maxFile !== "unlimited" && files.length > maxFile)
      throw new FormError("", "", t`You can only add a maximum of ${maxFile} files`);

    for (const file of Array.from(files)) {
      new Byte(file, maxSize);
    }
  };

  const handleFilesChange = (files: File[]) => {
    validateFiles(files);
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setFilePreviews(urls);
    onFileLoaded?.(urls);
  };

  const handleDeleteFile = (files: File[], index: number, onChange: (files: File[]) => void) => {
    const dataTransfer = new DataTransfer();
    files.forEach((file, n) => index !== n && dataTransfer.items.add(file));

    (document.getElementById("inner-file-input") as HTMLInputElement).files! = dataTransfer.files;
    onChange(files.filter((_, n) => index !== n));
    onFileLoaded?.(filePreviews.filter((_, n) => index !== n));
    setFilePreviews(filePreviews.filter((_, n) => index !== n));
    if (minFile && dataTransfer.files.length < minFile)
      throw new FormError("", "", t`You must add more than ${minFile} files`);
  };

  return {
    filePreviews,
    onChangeFile,
    handleDeleteFile
  };
};
