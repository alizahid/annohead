import { type SearchType } from '@anno/db/search'
import { kebabCase } from 'lodash'

export function getUrl(type: SearchType, id: number, name?: string | null) {
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

  if (name) {
    return `/${base}/${id}/${kebabCase(name)}`
  }

  return `/${base}/${id}/${type}`
}
