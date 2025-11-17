import { paths as pathPrices } from "~/app/api/v1/prices/documentation";
import { paths as pathPriceSearch } from "~/app/api/v1/prices/search/documentation";
import { paths as pathProducts } from "~/app/api/v1/products/[barcode]/documentation";
import { paths as pathAccount } from "~/app/api/v1/user/[id]/account/documentation";
import { paths as pathDeleteUserPrice } from "~/app/api/v1/user/[id]/prices/[priceId]/documentation";
import { paths as pathUserPrices } from "~/app/api/v1/user/[id]/prices/documentation";
import { paths as pathProfileAvatar } from "~/app/api/v1/user/[id]/profile/avatar/documentation";
import { paths as pathProfile } from "~/app/api/v1/user/[id]/profile/documentation";

const routePaths = {
  ...pathAccount,
  ...pathPrices,
  ...pathProfile,
  ...pathProfileAvatar,
  ...pathUserPrices,
  ...pathDeleteUserPrice,
  ...pathPriceSearch,
  ...pathProducts
};

export { routePaths as paths };
