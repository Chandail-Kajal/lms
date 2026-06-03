import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  // suppress known Turbopack HMR noise
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

