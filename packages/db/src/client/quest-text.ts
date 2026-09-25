import { type Lang } from '../enums'

type Role = 'governor' | 'emperor' | 'island' | 'unknown'

/** Names the game fills in at runtime, as roles: grammar-neutral in both languages ("citizens of [Island]") */
const roles: Record<Lang, Record<Role, string>> = {
  de: {
    emperor: '[Kaiser]',
    governor: '[Statthalter]',
    island: '[Insel]',
    unknown: '[…]',
  },
  en: {
    emperor: '[Emperor]',
    governor: '[Governor]',
    island: '[Island]',
    unknown: '[…]',
  },
}

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
      .replace(PLACEHOLDER, (placeholder) => roles[lang][role(placeholder)]) ??
    null
  )
}

const BOLD = /<b>([\s\S]*?)<\/b>/g
const TAG = /<[^>]+>/g
const QUESTION = /[^.!?\n]*\?+/g

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
