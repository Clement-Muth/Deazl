import { SuspendedView } from "~/components/Skeletons/SuspendedView";
import { getRecipeHubData } from "../Api";
import { RecipeHubContent } from "./RecipeHubContent";

interface RecipeHubLayoutProps {
  hubData?: Awaited<ReturnType<typeof getRecipeHubData>>;
}

const RecipeHubLayout = ({ hubData }: RecipeHubLayoutProps) => {
  return <RecipeHubContent hubData={hubData ?? null} />;
};

const RecipeHubData = async () => {
  const hubData = await getRecipeHubData();

  return <RecipeHubLayout hubData={hubData} />;
};

export const RecipeHub = () => {
  return <SuspendedView fallback={RecipeHubLayout} content={RecipeHubData} props={{}} />;
};
