import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: rootDir,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
