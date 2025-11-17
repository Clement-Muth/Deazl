declare namespace NodeJS {
  interface ProcessEnv {
    PCOMPARATOR_PUBLIC_URL: string;
    PCOMPARATOR_ENV: "development" | "test" | "staging" | "production";
    PCOMPARATOR_API_ENDPOINT: string;
    OPEN_FOOD_FACT_API_ENDPOINT: string;
    OPEN_FOOD_FACT_PRICES_API_ENDPOINT: string;
    DATABASE_URL: string;
    POSTGRES_URL: string;
    ALGOLIA_APP_ID: string;
    ALGOLIA_API_KEY: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    AUTH_SECRET: string;
    BLOB_READ_WRITE_TOKEN: string;
    OPEN_FOOD_FACTS_USERNAME: string;
    OPEN_FOOD_FACTS_PASSWORD: string;
    OPENAI_API_KEY: string;
  }
}
