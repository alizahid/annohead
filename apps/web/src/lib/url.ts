import { type SearchType } from '@anno/db/search'

export const navigation = [
  {
    href: '/buildings',
    key: 'building',
  },
  {
    href: '/chains',
    key: 'chain',
  },
  {
    href: '/items',
    key: 'item',
  },
  {
    href: '/products',
    key: 'product',
  },
  {
    href: '/quests',
    key: 'quest',
  },
  {
    href: '/techs',
    key: 'tech',
  },
  {
    href: '/units',
    key: 'unit',
  },
] as const

export function getUrl(type: SearchType, id: number, slug?: string | null) {
  const base =
    type === 'building'
      ? 'buildings'
      : type === 'chain'
        ? 'chains'
        : type === 'item'
          ? 'items'
          : type === 'product'
            ? 'products'
            : type === 'quest'
              ? 'quests'
              : type === 'unit'
                ? 'units'
                : 'techs'

  return `/${base}/${id}/${slug ?? type}`
}
