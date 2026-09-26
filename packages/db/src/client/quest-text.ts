import { type Lang } from '../enums'
import { phrases } from './phrases'

type Role = 'governor' | 'emperor' | 'island' | 'unknown'

const PLACEHOLDER = /\{[^{}]*\}/g
const LINE_BREAK = /<br\s*\/?>/g

function role(placeholder: string): Role {
  if (placeholder.includes('LocationName')) {
    return 'island'
  }
  if (placeholder.includes('ActiveEmperor')) {
    return 'emperor'
  }
  if (placeholder.includes('QuestAssignee')) {
    return 'governor'
  }
  return 'unknown'
}

/** Quest text ready to render: runtime placeholders ("{Static.Tags.LocationName(…)}") become roles, `<br/>` newlines. */
export function questText(text: string | null, lang: Lang) {
  return (
    text
      ?.replace(LINE_BREAK, '\n')
      .replace(
        PLACEHOLDER,
        (placeholder) => phrases[lang].roles[role(placeholder)],
      ) ?? null
  )
}

const BOLD = /<b>([\s\S]*?)<\/b>/g
const TAG = /<[^>]+>/g
// CJK texts end sentences with full-width marks
const QUESTION = /[^.!?。！？\n]*[?？]+/g

/** The question a decision screen ends on: its last bold line, else its last sentence ending in "?". */
export function questQuestion(text: string | null, lang: Lang) {
  if (!text) {
    return null
  }
  const bold = [...text.matchAll(BOLD)].at(-1)?.[1]
  const question =
    bold ??
    text.replace(LINE_BREAK, '\n').replace(TAG, '').match(QUESTION)?.at(-1)
  return question ? questText(question.replace(TAG, '').trim(), lang) : null
}
