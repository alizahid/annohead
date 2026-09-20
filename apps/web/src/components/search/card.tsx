import { type SearchHit } from '@anno/db/client'

import { Link } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  item: SearchHit
}

export function SearchCard({ item }: Props) {
  return (
    <Link
      className="flex gap-4 rounded-lg p-4 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl(item.type, item.guid, item.name)}
    >
      <aside className="relative flex size-16">
        {item.icon ? (
          <Icon className="size-16" icon={item.icon} />
        ) : (
          <Icon className="size-16" icon={getIcon(item.type)} />
        )}

        {item.icon ? (
          <div className="absolute right-0 bottom-0 flex rounded-full bg-accent-2 p-1">
            <Icon className="size-4" icon={getIcon(item.type)} />
          </div>
        ) : null}
      </aside>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex gap-2">
          <div className="text-pretty font-bold">{item.name}</div>

          {item.type === 'building' || item.type === 'chain' ? (
            <div className="flex gap-2">
              {item.regions.map((region) => (
                <Icon icon={getIcon(region)} key={region} />
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
    </Link>
  )
}
