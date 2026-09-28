import { type SearchHit } from '@anno/db/client'
import { useTranslations } from 'next-intl'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'
import { Tooltip } from '../common/tooltip'
import { RegionCard } from '../shared/region'
import { SearchIcon } from './icon'

type Props = {
  item: SearchHit
}

export function SearchCard({ item }: Props) {
  const t = useTranslations('component.search.card')

  return (
    <NavLink
      className="flex gap-4 rounded-lg p-4 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl(item.type, item.guid, item.slug)}
    >
      <aside className="relative flex size-16 shrink-0">
        <SearchIcon className="size-16" item={item} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex gap-2">
          <div className="text-pretty font-bold">{item.name}</div>

          <Tooltip content={t(`type.${item.type}`)} render={<div />}>
            <Icon className="size-6" icon={getIcon(`ui.${item.type}`)} />
          </Tooltip>

          {item.type === 'building' ||
          item.type === 'chain' ||
          item.type === 'unit' ||
          item.type === 'ornament' ? (
            <div className="flex gap-2">
              {item.regions.map((region) => (
                <RegionCard key={region} region={region} />
              ))}
            </div>
          ) : null}
        </div>

        {item.description ? (
          <div className="line-clamp-1 text-gray-11 text-sm">
            {item.description}
          </div>
        ) : null}
      </div>
    </NavLink>
  )
}
