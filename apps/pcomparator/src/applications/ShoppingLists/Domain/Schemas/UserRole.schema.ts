import { z } from "zod";

export const UserRoleEnum = z.enum(["OWNER", "EDITOR", "VIEWER"]);
