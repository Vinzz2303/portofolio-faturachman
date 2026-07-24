// ── Output normalizer ────────────────────────────────────────────────────────
// The LLM may occasionally return JSON despite the system prompt.
// This layer ensures the UI always receives clean, human-readable prose.

type KnownStructuredShape = {
  direct_answer?: string
  why_it_matters?: unknown
  risk_note?: string
  suggested_next_step?: string
  reply?: string
  text?: string
  answer?: string
  content?: string
}

function joinArray(val: unknown): string {
  if (Array.isArray(val)) return val.filter(Boolean).join(' ')
  if (typeof val === 'string') return val
  return ''
}

export function enforcePlainText(raw: unknown, fallbackText: string): string {
  // 1. Already clean plain text — return as-is
  if (typeof raw === 'string') {
    let trimmed = raw.trim()

    // 1. Strip markdown codeblocks
    trimmed = trimmed.replace(/^```(json|blocks)?\s*/i, '')
    trimmed = trimmed.replace(/\s*```$/i, '')
    trimmed = trimmed.replace(/^json\s*/i, '').trim()

    // 2. Extra check for JSON-like structures even if not explicitly stringified properly
    const hasJsonArtifacts =
      trimmed.includes('{') ||
      trimmed.includes('direct_answer') ||
      trimmed.includes('why_it_matters')

    if (hasJsonArtifacts) {
      try {
        // Try to find valid JSON substring if it's mixed with text
        const firstBrace = trimmed.indexOf('{')
        const lastBrace = trimmed.lastIndexOf('}')
        
        if (firstBrace >= 0 && lastBrace >= firstBrace) {
          const jsonStr = trimmed.substring(firstBrace, lastBrace + 1)
          const parsed = JSON.parse(jsonStr)
          return enforcePlainText(parsed, fallbackText)
        }
      } catch {
        // Parsing failed — system resilient to LLM failure
        return fallbackText
      }
    }

    return trimmed || fallbackText
  }

  // 2. Structured Object — Flatten it into prose
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as KnownStructuredShape

    const parts: string[] = []

    // Map common structural keys into a flowing paragraph
    if (obj.direct_answer) parts.push(obj.direct_answer)
    if (obj.reply) parts.push(obj.reply)
    if (obj.text) parts.push(obj.text)
    if (obj.answer) parts.push(obj.answer)
    if (obj.content) parts.push(obj.content)

    if (obj.why_it_matters) {
      const whyStr = joinArray(obj.why_it_matters)
      if (whyStr) parts.push(whyStr)
    }

    if (obj.risk_note) {
      parts.push(obj.risk_note)
    }

    if (obj.suggested_next_step) {
      parts.push(obj.suggested_next_step)
    }

    // If it's a completely unknown object, fallback to values only
    if (parts.length === 0) {
      const values = Object.values(obj)
        .map(v => (typeof v === 'string' ? v : joinArray(v)))
        .filter(Boolean)
      if (values.length > 0) return values.join(' ')
    }

    const merged = parts.filter(Boolean).join(' ')
    return merged || fallbackText
  }

  return fallbackText
}
