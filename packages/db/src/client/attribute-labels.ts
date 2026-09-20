import { type Attribute, type Lang } from '../enums'

const attributeNames: Record<Lang, Record<Attribute, string>> = {
  de: {
    AdditionalNeedAttributes: 'Zusätzliche Bedürfnisattribute',
    Belief: 'Glaube',
    FireSafety: 'Brandschutz',
    Happiness: 'Zufriedenheit',
    Health: 'Gesundheit',
    Knowledge: 'Wissen',
    Money: 'Einkommen',
    Population: 'Bevölkerung',
    Prestige: 'Prestige',
  },
  en: {
    AdditionalNeedAttributes: 'Additional need attributes',
    Belief: 'Belief',
    FireSafety: 'Fire safety',
    Happiness: 'Happiness',
    Health: 'Health',
    Knowledge: 'Knowledge',
    Money: 'Income',
    Population: 'Population',
    Prestige: 'Prestige',
  },
}

export function attributeName(attribute: Attribute | null, lang: Lang) {
  return attribute === null ? null : attributeNames[lang][attribute]
}
