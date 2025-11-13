import { Trans } from "@lingui/react/macro";
import { redirect } from "next/navigation";
import { StoreEnrichmentPanel } from "~/applications/StoreManagement/Ui/StoreEnrichmentPanel";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";

const StoreEnrichmentPage = async () => {
  const session = await auth();

  // TODO: Add admin role check when implemented
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <Trans>Store Management</Trans>
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            <Trans>Manage store data and GPS coordinates for distance-based price optimization</Trans>
          </p>
        </div>

        <StoreEnrichmentPanel />
      </div>
    </main>
  );
};

export default withLinguiPage(StoreEnrichmentPage);
