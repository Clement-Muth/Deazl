import { createKysely } from "@vercel/postgres-kysely";
import type { DB } from "~/types/db";

export const db = createKysely<DB>();
