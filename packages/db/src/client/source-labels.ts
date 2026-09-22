import { type ItemSourceKind, type Lang } from '../enums'

/** `{name}` is the trader, festival, tech or quest the item comes from; kinds without a named source have none. */
const phrases: Record<Lang, Record<ItemSourceKind, string>> = {
  de: {
    contract: 'Vertragsbelohnung von {name}',
    defeated: '{name} besiegen',
    festival: 'Belohnung: {name}',
    quest: 'Questbelohnung: {name}',
    shipDrop: 'Beute von Schiffen von {name}',
    storyline: 'Questbelohnung',
    tech: '{name} erforschen',
    trader: 'Verkauft von {name}',
    visitor: 'Heroischer Besucher',
  },
  en: {
    contract: 'Contract reward from {name}',
    defeated: 'Defeat {name}',
    festival: '{name} reward',
    quest: 'Quest reward: {name}',
    shipDrop: 'Dropped by ships of {name}',
    storyline: 'Quest reward',
    tech: 'Research {name}',
    trader: 'Sold by {name}',
    visitor: 'Heroic visitor',
  },
}

/** Human-readable origin, e.g. "Sold by Julia" or "Defeat Dorian". */
export function sourceLabel(
  kind: ItemSourceKind,
  name: string | null,
  lang: Lang,
) {
  return phrases[lang][kind].replace('{name}', name ?? '').trim()
}
