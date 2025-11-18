import { auth } from "@deazl/system";
import type { ReactNode } from "react";
import { Footer } from "~/components/Footer/Footer";
import { Toast } from "~/components/Toast/Toast";
import { Tabbar } from "~/core/Tabbar";
import { getDevice } from "~/core/getDevice";

export interface ApplicationLayoutProps {
  children: ReactNode;
}

const ApplicationLayout = async ({ children }: ApplicationLayoutProps) => {
  const device = await getDevice();
  const session = await auth();

  return (
    <>
      <main className="flex flex-1 w-full pb-6">{children}</main>
      {device === "mobile" && session?.user ? <Tabbar isSignedIn={!!session?.user} /> : null}
      {!session?.user ? <Footer /> : null}
      <Toast />
    </>
  );
};

export default ApplicationLayout;
