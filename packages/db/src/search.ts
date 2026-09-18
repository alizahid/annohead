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

/** Generic game UI icon per type; fallback when a record's `icon` is null. Same path format as `icon`. */
export const searchTypeIcons: Record<SearchType, string> = {
  building:
    'data/ui/2kimages/main/icons/construction/icon_construction_main.png',
  chain: 'data/ui/2kimages/main/icons/icon_construction_chain.png',
  item: 'data/ui/2kimages/main/icons/icon_goods_storage.png',
  product: 'data/ui/2kimages/main/icons/icon_itemsockets_01.png',
  quest: 'data/ui/2kimages/main/icons/icon_questmain.png',
  tech: 'data/ui/2kimages/main/icons/icon_research.png',
}

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
