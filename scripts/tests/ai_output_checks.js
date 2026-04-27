#!/usr/bin/env node
// Simple checks for AI output:
// - detect English leakage (basic stopword list)
// - check required Indonesian keys/phrases exist (Evidence, Interpretasi, Implikasi, Confidence)
// - detect repeated paragraphs (simple template fingerprint)

const fs = require('fs')

const englishTokens = [
  'the','and','or','live','fallback','cache','database','confidence','percent','%','API','token'
]

const requiredIndoKeywords = ['Evidence', 'Interpretasi', 'Implikasi', 'Confidence', 'Hipotesis', 'Saran']

function readInput() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Usage: node ai_output_checks.js <path-or-text>')
    process.exit(2)
  }
  if (fs.existsSync(arg)) return fs.readFileSync(arg, 'utf8')
  return arg
}

function detectEnglishLeakage(text) {
  const lower = text.toLowerCase()
  const found = englishTokens.filter(t => lower.includes(t))
  return [...new Set(found)]
}

function detectRepetition(text) {
  // split into paragraphs and count duplicates
  const paras = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  const counts = {}
  paras.forEach(p => { counts[p] = (counts[p]||0) + 1 })
  const duplicates = Object.entries(counts).filter(([,c]) => c>1).map(([p,c]) => ({count:c, text:p.slice(0,120)}))
  return {paras:paras.length, duplicates}
}

function checkIndoKeywords(text) {
  const found = requiredIndoKeywords.filter(k => text.includes(k))
  return {missing: requiredIndoKeywords.filter(k => !found.includes(k)), found}
}

const text = readInput()
const english = detectEnglishLeakage(text)
const rep = detectRepetition(text)
const indo = checkIndoKeywords(text)

console.log('=== AI OUTPUT CHECKS ===')
console.log('Length:', text.length)
console.log('Paragraphs:', rep.paras)
if (english.length) console.log('English tokens found:', english.join(', '))
else console.log('English leakage: none detected')
if (rep.duplicates.length) console.log('Duplicate paragraphs (possible template reuse):', rep.duplicates)
else console.log('Template duplication: none detected')
if (indo.missing.length) console.log('Missing Indonesian structure keywords:', indo.missing)
else console.log('Indonesian structure: OK')

if (english.length || rep.duplicates.length || indo.missing.length) process.exit(1)
process.exit(0)
