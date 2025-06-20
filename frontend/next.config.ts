import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "f7f6dea7-4509-428e-a8df-cb6df0d039b2"
});

export default withCivicAuth(nextConfig)