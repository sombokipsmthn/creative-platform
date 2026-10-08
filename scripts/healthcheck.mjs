const baseUrl = (process.argv[2] || process.env.SMOKE_TEST_URL || "https://creative-platform-sombokipsmthns-projects.vercel.app").replace(/\/$/, "");
const url = `${baseUrl}/api/health`;

const headers = {};
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (bypassSecret) {
  headers["x-vercel-protection-bypass"] = bypassSecret;
}

const response = await fetch(url, { headers, redirect: "manual" });
const body = await response.text();

if (!response.ok) {
  throw new Error(`Health check failed: ${response.status} ${response.statusText} ${body}`);
}

let payload;
try {
  payload = JSON.parse(body);
} catch {
  throw new Error(`Health check returned non-JSON content: ${body}`);
}

if (payload.status && payload.status !== "ok" && payload.status !== "healthy") {
  throw new Error(`Health check reported status ${payload.status}`);
}

console.log(`Health check passed: ${url} (${response.status})`);
