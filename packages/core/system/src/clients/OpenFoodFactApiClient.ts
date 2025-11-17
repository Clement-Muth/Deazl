// import { addBreadcrumb as sentryAddBreadcrumb } from "@sentry/nextjs";
import ky, { HTTPError, type NormalizedOptions } from "ky";

const openFoodFactApiEndpoint = process.env.OPEN_FOOD_FACT_API_ENDPOINT;
if (!openFoodFactApiEndpoint) {
  throw new Error("The environment variable 'OPEN_FOOD_FACT_API_ENDPOINT' is missing");
}

export const openFoodFactApiClient = ky.create({
  retry: 1,

  prefixUrl: `${process.env.OPEN_FOOD_FACT_API_ENDPOINT}`,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },

  hooks: {
    beforeRequest: [],

    beforeError: [
      (error) => {
        // sentryAddBreadcrumb({
        //   type: "http",
        //   category: "network",
        //   data: {
        //     // Request
        //     method: error.request.method,
        //     url: error.request.url,
        //     headers: Object.fromEntries(error.request.headers.entries()),
        //     body: error.request.body,

        //     // Response
        //     status_code: error.response.status,
        //     reason: error.response.statusText,
        //     apiGwRequestId: error.response.headers.get("apigw-requestid")
        //   },
        //   level: "error"
        // });

        return error;
      }
    ],

    afterResponse: [
      (request: Request, options: NormalizedOptions, response: Response) => {
        // sentryAddBreadcrumb({
        //   type: "http",
        //   category: "network",
        //   data: {
        //     // Request
        //     method: request.method,
        //     url: request.url,
        //     headers: Object.fromEntries(request.headers.entries()),
        //     body: request.body,

        //     // Response
        //     status_code: response.status,
        //     reason: response.statusText,
        //     apiGwRequestId: response.headers.get("apigw-requestid")
        //   },
        //   level: "info"
        // });

        return response;
      },

      (request: Request, options: NormalizedOptions, response: Response) => {
        // Transform 202 into error to allow retry at higher level
        if (response.status === 202) {
          throw new HTTPError(response, request, options);
        }

        return response;
      }
    ]
  }
});
