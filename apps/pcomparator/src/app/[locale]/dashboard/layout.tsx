import { Trans } from "@lingui/react/macro";
import { Euro, MoveLeft } from "lucide-react";
import Link from "~/components/Link/Link";
import { type NextPageProps, withLinguiLayout } from "~/core/withLinguiLayout";

const DashboardLayout = ({ children }: NextPageProps) => {
  return (
    <div className="flex flex-1">
      <aside className="sticky top-24 w-72 h-[calc(100dvh-96px)] p-6 mt-8 flex-col hidden md:flex">
        <nav className="h-auto flex-1">
          <ul>
            <li>
              <Link
                href="/dashboard/my-prices"
                className="hover:bg-gray-500/20 w-full p-2 rounded-small text-small"
              >
                <Euro size="16px" />
                <p className="ml-2">
                  <Trans>My Prices</Trans>
                </p>
              </Link>
            </li>
          </ul>
        </nav>
        <Link href="/" className="flex gap-2 hover:bg-gray-500/20 w-full p-2 rounded-small text-small">
          <MoveLeft size="16px" />
          <Trans>Return to the app</Trans>
        </Link>
      </aside>
      {children}
    </div>
  );
};

export default withLinguiLayout(DashboardLayout);
