export const SearchTypes = [
  'building',
  'item',
  'product',
  'tech',
  'quest',
  'chain',
  'unit',
] as const

export type SearchType = (typeof SearchTypes)[number]
