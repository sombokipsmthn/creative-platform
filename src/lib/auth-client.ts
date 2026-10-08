import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";

const identifyUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL?.trim();

export const authClient = createAuthClient({
  plugins: identifyUrl ? [sentinelClient({ identifyUrl })] : [],
});
