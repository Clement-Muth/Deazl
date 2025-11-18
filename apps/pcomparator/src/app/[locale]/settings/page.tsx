import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";
import { SettingsPage } from "~/views/Settings";

const SettingsPageComponent = async () => {
  const session = await auth();

  return (
    <SettingsPage
      userImage={session?.user?.image}
      userName={session?.user?.name}
      phoneNumber={session?.user?.phone}
      userId={session?.user?.id!}
    />
  );
};

export default withLinguiPage(SettingsPageComponent);
