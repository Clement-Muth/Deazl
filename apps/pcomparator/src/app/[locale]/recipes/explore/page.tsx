import { RecipeSearchPage } from "~/applications/Recipes/Ui/RecipeSearchPage";
import { withLinguiPage } from "~/core/withLinguiLayout";

const RecipeExplorePage = () => {
  return <RecipeSearchPage />;
};

export default withLinguiPage(RecipeExplorePage);
