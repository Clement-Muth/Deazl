import type { ReactNode } from "react";
import { Toast } from "~/components/Toast/Toast";
import { Tabbar } from "./Tabbar";

export interface ApplicationLayoutProps {
  children: ReactNode;
}

const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  return (
    <>
      {/* <Suspense fallback={<div>Loading…</div>}> */}
      <main className="flex flex-1 w-full pb-6">{children}</main>
      {/* </Suspense> */}
      <Tabbar />
      {/* {!session?.user ? <Footer /> : null} */}
      <Toast />
    </>
  );
};

export default ApplicationLayout;
