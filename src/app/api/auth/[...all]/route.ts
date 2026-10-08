import { toNextJsHandler } from "better-auth/next-js";
import { betterAuthInstance } from "@/lib/auth";

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(betterAuthInstance);
