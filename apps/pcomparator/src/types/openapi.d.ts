import type { ZodOpenApiOperationObject } from "zod-openapi";

interface PathItem {
  delete?: ZodOpenApiOperationObject;
  post?: ZodOpenApiOperationObject;
  put?: ZodOpenApiOperationObject;
  get?: ZodOpenApiOperationObject;
  patch?: ZodOpenApiOperationObject;
  options?: ZodOpenApiOperationObject;
  head?: ZodOpenApiOperationObject;
}

export interface OpenAPIPath {
  [path: string]: PathItem;
}
