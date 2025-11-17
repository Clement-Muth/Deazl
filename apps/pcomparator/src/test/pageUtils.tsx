import type { ParsedUrlQuery } from "node:querystring";
import type { GetServerSidePropsContext } from "next";

export const buildFakeContext = ({
  locale = "fr",
  defaultLocale = "en",
  query = {}
}: {
  locale?: string;
  defaultLocale?: string;
  query?: Record<string, any>;
}): GetServerSidePropsContext =>
  ({
    locale,
    defaultLocale,
    query: query as unknown as ParsedUrlQuery
  }) as GetServerSidePropsContext;
