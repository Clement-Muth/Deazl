import { omit } from "lodash";
import { client, productsIndex } from ".";

export interface SearchResult<T> {
  type: string;
  hits: T[];
}

interface SearchOnAlgoliaInput<T = unknown> {
  index: string;
  query: string;
  filters?: string;
  hits?: T;
  aroundLatLng?: string;
  aroundRadius?: number;
  hitsPerPage?: number;
}

type Result = { results: { hits: Record<string, string>[] }[] };

export default async function searchOnAlgolia<T>(queries: SearchOnAlgoliaInput[]) {
  const query = queries.map((i) => {
    const { index, ...rest } = i;
    return {
      indexName: index,
      params: { ...rest, hitsPerPage: 2000 }
    };
  });
  const { results } = await client.multipleQueries(query);
  const res = results as unknown as SearchOnAlgoliaInput<T>[];

  return res.map((r) => r.hits).at(0);
}

export const searchProductsWithCategory = async (
  search: string
): Promise<{ categories: any[]; data: any[] }> => {
  const res = (await productsIndex.search(search, { hitsPerPage: 2000 })).hits.map(
    (r) =>
      ({
        ...omit(r, "_highlightResult", "objectID", "path"),
        productId: r.objectID
      }) as any
  );

  // @ts-ignore
  const categories = !search?.length ? [""] : [...new Set(res.map((r) => r.category))];

  const result = (await client.multipleQueries(
    categories.map((category) => ({
      indexName: "prod_Categories",
      params: { query: category, hitsPerPage: 2000 }
    }))
  )) as unknown as Result;

  return {
    categories: result.results
      .flatMap((r) => r.hits)
      .map((r) => omit(r, "_highlightResult", "objectID", "path") as any),
    data: res
  };
};
