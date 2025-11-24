import { Suspense } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<div>Loading…</div>}>{children}</Suspense>;
};

export default AuthLayout;
