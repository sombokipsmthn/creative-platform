export type LocalAuthBypassState = {
  enabled: boolean;
  nodeEnv: string | undefined;
  flagConfigured: boolean;
  hostname: string;
  localHostname: boolean;
};

export function getLocalAuthBypassState(
  request: Request,
  env: Pick<NodeJS.ProcessEnv, "NODE_ENV" | "LOCAL_AUTH_BYPASS"> = {
    NODE_ENV: process.env.NODE_ENV,
    LOCAL_AUTH_BYPASS: process.env.LOCAL_AUTH_BYPASS,
  },
): LocalAuthBypassState {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname.toLowerCase();
  const localHostname = hostname === "localhost" || hostname === "127.0.0.1";
  const flagConfigured = env.LOCAL_AUTH_BYPASS === "true";

  return {
    enabled: env.NODE_ENV === "development" && flagConfigured && localHostname,
    nodeEnv: env.NODE_ENV,
    flagConfigured,
    hostname,
    localHostname,
  };
}

export function isLocalAuthBypassEnabled(request: Request) {
  return getLocalAuthBypassState(request).enabled;
}
