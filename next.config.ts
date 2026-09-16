import type { NextConfig } from 'next';

const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? '/KPL.lk' : '';
const config: NextConfig = {
  devIndicators: false,
  ...(pages ? { output: 'export' as const, trailingSlash: true } : {}),
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
