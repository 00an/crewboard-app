/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// The frontend calls the backend API cross-origin (different port locally,
// typically a different subdomain in production), so CSP's connect-src has
// to explicitly allow it. Falls back to the two local dev ports if the env
// var isn't set.
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").trim();

const csp = [
  "default-src 'self'",
  // Production script-src is locked to 'self' only — no inline or eval'd
  // scripts. The dev server itself needs 'unsafe-eval' (webpack's dev
  // source maps) and 'unsafe-inline' (the HMR/webpack runtime it injects
  // as inline <script> tags) to function at all; neither is needed once
  // Next.js ships a production build, so both are dropped there.
  `script-src 'self'${isProd ? "" : " 'unsafe-eval' 'unsafe-inline'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} http://localhost:3001`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
