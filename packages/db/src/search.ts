import {
  type BuildingKind,
  type ItemType,
  type Lang,
  type QuestCategory,
  type Region,
} from './enums'

export const searchTypes = [
  'building',
  'item',
  'product',
  'tech',
  'quest',
  'chain',
] as const
export type SearchType = (typeof searchTypes)[number]

type Entry<T extends SearchType, Extra = unknown> = {
  objectID: `${T}_${number}`
  type: T
  guid: number
  icon: string | null
  name: Partial<Record<Lang, string>>
  description: Partial<Record<Lang, string>>
} & Extra

/** Shape of every record in the Algolia index; use as `Hit<SearchRecord>`. */
export type SearchRecord =
  | Entry<'building', { category: BuildingKind; regions: Array<Region> }>
  | Entry<'item', { category: ItemType }>
  | Entry<'quest', { category: QuestCategory }>
  | Entry<'product'>
  | Entry<'tech'>
  | Entry<'chain'>
