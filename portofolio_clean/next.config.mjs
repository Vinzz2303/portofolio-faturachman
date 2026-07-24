import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable static export in production build.
  // In dev mode this is disabled so rewrites and dynamic routes work correctly.
  ...(isDev ? {} : { output: 'export' }),
  outputFileTracingRoot: rootDir,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // In dev mode, proxy /api/* requests to the Express backend running on port 3002
  ...(isDev && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3002/api/:path*',
        },
      ]
    },
  }),
}

export default nextConfig
