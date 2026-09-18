export const SearchTypes = [
  'building',
  'item',
  'product',
  'tech',
  'quest',
  'chain',
] as const

export type SearchType = (typeof SearchTypes)[number]
