import type { ReactNode } from "react";
import { Toast } from "~/components/Toast/Toast";
import { Tabbar } from "./Tabbar";

export interface ApplicationLayoutProps {
  children: ReactNode;
}

const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  return (
    <>
      <main className="flex flex-1 w-full pb-6 pt-16">{children}</main>
      <Tabbar />
      <Toast />
    </>
  );
};

export default ApplicationLayout;
