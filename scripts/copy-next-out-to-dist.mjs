import { cp, rm, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const outDir = resolve(root, 'out')
const distDir = resolve(root, 'dist')

await rm(distDir, { recursive: true, force: true })
await cp(outDir, distDir, { recursive: true })

// Always ensure the latest web.config from public/ is in dist/
// (Next.js copies public/* to out/ but we force it as a safety net)
await copyFile(resolve(root, 'public', 'web.config'), resolve(distDir, 'web.config'))

console.log('Copied Next static export from out/ to dist/.')
