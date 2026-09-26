import { type SearchType } from '@anno/db/search'

/** `slug` is the English one the DB stores, so a page has the same path in every language */
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
              : 'techs'

  return `/${base}/${id}/${slug ?? type}`
}
