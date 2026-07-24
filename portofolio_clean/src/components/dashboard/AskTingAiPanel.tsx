import React from 'react'
import type { DashboardCopy } from './types'

type Props = {
  copy: DashboardCopy
}

export default function AskTingAiPanel({ copy }: Props) {
  const prompts = [
    copy.askPromptOne,
    copy.askPromptTwo,
    copy.askPromptThree,
    copy.askPromptFour
  ]

  return (
    <section className="card dashboard-card" id="ask-ting-ai">
      <div className="dashboard-summary-head context-layer-head">
        <div>
          <p className="dashboard-summary-kicker">{copy.askTingAi}</p>
          <h3 style={{ fontSize: '1.06rem' }}>{copy.askTingAi}</h3>
          <p className="summary-text context-layer-summary">{copy.askTingAiLead}</p>
        </div>
      </div>

      <div className="ask-ting-ai-box">
        <input
          className="ask-ting-ai-input"
          type="text"
          value=""
          readOnly
          placeholder={copy.askTingAiPlaceholder}
          aria-label={copy.askTingAi}
        />
        <span className="ask-ting-ai-hint">{copy.askTingAiDisabled}</span>
      </div>

      <div className="ask-ting-ai-prompts">
        {prompts.map((prompt) => (
          <button key={prompt} className="ask-ting-ai-chip" type="button" disabled>
            {prompt}
          </button>
        ))}
      </div>
    </section>
  )
}
