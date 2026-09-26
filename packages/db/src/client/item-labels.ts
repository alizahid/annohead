import { allocationValues, type Lang, type Niche, type Rarity } from '../enums'
import { labels } from './labels'

/** game order, not alphabetical */
const rarityOrder = [
  'Common',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Unique',
  'Quest',
] as const satisfies ReadonlyArray<Rarity>

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

/** Specialist (villa), Captain (ship) or Item: the game's allocation */
export async function types({ lang }: { lang: Lang }) {
  const l = await labels(lang)
  return allocationValues.map((key) => ({
    key,
    name: l('allocation', key)?.name ?? key,
  }))
}

export async function rarities({ lang }: { lang: Lang }) {
  const l = await labels(lang)
  return rarityOrder.map((key) => ({
    key,
    name: l('rarity', key)?.name ?? key,
  }))
}

export async function niches({ lang }: { lang: Lang }) {
  const l = await labels(lang)
  return nicheOrder.map((key) => ({
    key,
    name: l('niche', key)?.name ?? key,
  }))
}
