import {
  type Allocation,
  allocationValues,
  type ItemType,
  itemTypeValues,
  type Lang,
  type Niche,
  type Rarity,
} from '../enums'

/** game order, not alphabetical */
const rarityOrder = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Unique',
  'Quest',
] as const satisfies ReadonlyArray<Rarity>

const rarityNames: Record<Lang, Record<Rarity, string>> = {
  de: {
    Common: 'Gewöhnlich',
    Epic: 'Episch',
    Legendary: 'Legendär',
    Mythic: 'Mythisch',
    Quest: 'Quest',
    Rare: 'Selten',
    Uncommon: 'Ungewöhnlich',
    Unique: 'Einzigartig',
  },
  en: {
    Common: 'Common',
    Epic: 'Epic',
    Legendary: 'Legendary',
    Mythic: 'Mythic',
    Quest: 'Quest',
    Rare: 'Rare',
    Uncommon: 'Uncommon',
    Unique: 'Unique',
  },
}

/** `None` is not a category, so it's excluded from the filter list */
const nicheOrder = [
  'Diplomacy',
  'Economy',
  'Religion',
  'Culture',
  'Finance',
  'Military',
  'Agriculture',
  'Research',
  'Nautics',
] as const satisfies ReadonlyArray<Niche>

const nicheNames: Record<Lang, Record<Niche, string>> = {
  de: {
    Agriculture: 'Natur',
    Culture: 'Kultur',
    Diplomacy: 'Zivil',
    Economy: 'Wirtschaft',
    Finance: 'Finanzen',
    Military: 'Militär',
    Nautics: 'Seefahrt',
    None: 'Keine',
    Religion: 'Religion',
    Research: 'Forschung',
  },
  en: {
    Agriculture: 'Nature',
    Culture: 'Culture',
    Diplomacy: 'Civic',
    Economy: 'Economic',
    Finance: 'Finance',
    Military: 'Military',
    Nautics: 'Seafaring',
    None: 'None',
    Religion: 'Religion',
    Research: 'Research',
  },
}

const allocationNames: Record<Lang, Record<Allocation, string>> = {
  de: {
    None: 'Keine',
    Ship: 'Schiff',
    Villa: 'Villa',
  },
  en: {
    None: 'None',
    Ship: 'Ship',
    Villa: 'Villa',
  },
}

const typeNames: Record<Lang, Record<ItemType, string>> = {
  de: {
    Captains: 'Kapitäne',
    None: 'Keine',
    NonSocketable: 'Nicht einsetzbar',
    Specialist: 'Spezialisten',
  },
  en: {
    Captains: 'Captains',
    None: 'None',
    NonSocketable: 'Non-socketable',
    Specialist: 'Specialists',
  },
}

export function rarityLabel(key: Rarity | null, lang: Lang) {
  return key === null ? null : { key, name: rarityNames[lang][key] }
}

export function nicheLabel(key: Niche | null, lang: Lang) {
  return key === null ? null : { key, name: nicheNames[lang][key] }
}

export function typeLabel(key: ItemType | null, lang: Lang) {
  return key === null ? null : { key, name: typeNames[lang][key] }
}

export function allocations({ lang }: { lang: Lang }) {
  return allocationValues.map((key) => ({
    key,
    name: allocationNames[lang][key],
  }))
}

export function types({ lang }: { lang: Lang }) {
  return itemTypeValues.map((key) => ({
    key,
    name: typeNames[lang][key],
  }))
}

export function rarities({ lang }: { lang: Lang }) {
  return rarityOrder.map((key) => ({
    key,
    name: rarityNames[lang][key],
  }))
}

export function niches({ lang }: { lang: Lang }) {
  return nicheOrder.map((key) => ({
    key,
    name: nicheNames[lang][key],
  }))
}
