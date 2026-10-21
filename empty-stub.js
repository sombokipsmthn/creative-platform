// Cloudflare Workers does not bundle the native sharp implementation.
export default function sharpStub() {
  throw new Error("sharp is unavailable in the Cloudflare Workers runtime");
}
