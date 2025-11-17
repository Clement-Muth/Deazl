import { Trans } from "@lingui/react/macro";
import { withLinguiPage } from "~/core/withLinguiLayout";

const DashboardPage = () => {
  return (
    <main className="flex flex-col items-center w-full p-4 md:mt-8">
      <div className="flex flex-col gap-y-8 max-w-4xl w-[inherit]">
        <h1 className="text-xl md:text-2xl">
          <Trans>Account Settings</Trans>
        </h1>
      </div>
    </main>
  );
};

export default withLinguiPage(DashboardPage);
