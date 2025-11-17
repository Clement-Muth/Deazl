// import { addBreadcrumb as sentryAddBreadcrumb } from "@sentry/nextjs";
import ky, { HTTPError, type NormalizedOptions } from "ky";

const openFoodFactApiEndpoint = process.env.OPEN_FOOD_FACT_API_ENDPOINT;
if (!openFoodFactApiEndpoint) {
  throw new Error("The environment variable 'OPEN_FOOD_FACT_API_ENDPOINT' is missing");
}

export const OpenFoodFactPricesApiClient = ky.create({
  retry: 1,

  prefixUrl: `${process.env.OPEN_FOOD_FACT_PRICES_API_ENDPOINT}`,

  hooks: {
    beforeRequest: [],

    beforeError: [(error) => error],

    afterResponse: [
      (request: Request, options: NormalizedOptions, response: Response) => response,

      (request: Request, options: NormalizedOptions, response: Response) => {
        // Transform 202 into error to allow retry at higher level
        if (response.status === 202) throw new HTTPError(response, request, options);

        return response;
      }
    ]
  }
});
