import algoliasearch from "algoliasearch";

export const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

export const productsIndex = client.initIndex("dev_PriceComparator");
export const categoriesIndex = client.initIndex("prod_Categories");
