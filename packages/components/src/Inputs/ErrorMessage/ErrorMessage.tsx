import type { ReactNode } from "react";

interface ErrorMessageProps {
  error: ReactNode | string | undefined | null;
}

export const ErrorMessage = ({ error }: ErrorMessageProps) =>
  error ? <p className="text-tiny text-danger">{error}</p> : null;
