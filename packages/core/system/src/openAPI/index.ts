import * as yaml from "yaml";
import { z } from "zod";
import {
  type ZodOpenApiPathsObject,
  type ZodOpenApiResponsesObject,
  createDocument,
  extendZodWithOpenApi
} from "zod-openapi";
// import { paths } from "~/app/api/v1/documentation";

extendZodWithOpenApi(z);

function extendPaths(originalPaths: ZodOpenApiPathsObject): ZodOpenApiPathsObject {
  const extendedPaths: ZodOpenApiPathsObject = {};

  const errorResponses: ZodOpenApiResponsesObject = {
    400: {
      description: "The request is malformed or contains invalid parameters. Please check the data provided.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "The request is malformed or contains invalid parameters. Please check the data provided."
              },
              name: { type: "string", example: "HTTPError" },
              status: { type: "integer", example: 400 },
              cause: { type: "string", example: "error cause" }
            },
            required: ["message", "name", "status", "cause"]
          }
        }
      }
    },
    404: {
      description: "The requested resource could not be found.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string", example: "The requested resource could not be found." }
            },
            required: ["error"]
          }
        }
      }
    },
    409: {
      description: "A similar entry already exists.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string", example: "A similar entry already exists." }
            },
            required: ["error"]
          }
        }
      }
    },
    500: {
      description: "Internal server error. Something went wrong on the server side.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string", example: "Internal Server Error." }
            },
            required: ["error"]
          }
        }
      }
    }
  };

  for (const path in originalPaths) {
    extendedPaths[path] = { ...originalPaths[path] };

    for (const method in originalPaths[path]) {
      if (originalPaths[path][method as any].responses) {
        extendedPaths[path][method as any].responses = {
          ...extendedPaths[path][method as any].responses,
          ...errorResponses
        };
      }
    }
  }

  return extendedPaths;
}

const extendedPaths = extendPaths({});

const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Price Comparator API",
    description: "An API for comparing prices of foods, cosmetics and more.",
    version: "1.0.0"
  },
  paths: extendedPaths,
  servers: [
    {
      url: "https://pcomparator.vercel.app/api",
      description: "The production server."
    }
  ]
});

console.log(yaml.stringify(document));
