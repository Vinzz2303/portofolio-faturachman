import { cp, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const outDir = resolve(root, 'out')
const distDir = resolve(root, 'dist')

await rm(distDir, { recursive: true, force: true })
await cp(outDir, distDir, { recursive: true })

console.log('Copied Next static export from out/ to dist/.')
