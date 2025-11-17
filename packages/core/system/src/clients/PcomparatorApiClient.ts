// import { headers } from "next/headers";
import type { Middleware } from "../openapi-fetch";
import createClient from "../openapi-fetch";

const pcomparatorApiEndpoint = process.env.PCOMPARATOR_API_ENDPOINT;
if (!pcomparatorApiEndpoint) {
  throw new Error("The environment variable 'PCOMPARATOR_API_ENDPOINT' is missing");
}

const PcomparatorApiClient = createClient<any>({
  baseUrl: `${process.env.PCOMPARATOR_API_ENDPOINT}/api/`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  querySerializer: {}
});

const middleware: Middleware = {
  async onResponse({ request, options, response }) {
    // Transform 202 into error to allow retry at higher level
    if (response.status === 202)
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);

    return response;
  }
};

const middlewareAuthenticated: Middleware = {
  async onRequest({ request }) {
    // request.headers.set("cookie", (await headers()).get("cookie")!);

    return request;
  }
};

PcomparatorApiClient.use(middleware);

const pcomparatorAuthenticatedApiClient = createClient<any>({
  baseUrl: `${process.env.PCOMPARATOR_API_ENDPOINT}/api`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  querySerializer: {}
});

pcomparatorAuthenticatedApiClient.use(middlewareAuthenticated);

export { PcomparatorApiClient, pcomparatorAuthenticatedApiClient };
