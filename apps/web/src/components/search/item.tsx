import { type SearchHit } from '@anno/db/client'
import { type SearchType } from '@anno/db/search'
import { kebabCase } from 'lodash'
import Image from 'next/image'

import { Link } from '@/intl/nav'
import { getIcon, getIconUrl } from '@/lib/icons'

type Props = {
  item: SearchHit
}

export function SearchItem({ item }: Props) {
  return (
    <Link
      className="flex gap-4 rounded-lg p-4 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl(item.type, item.guid, item.name)}
    >
      <aside className="relative flex size-16">
        {item.icon ? (
          <Image
            alt={item.name}
            className="size-16"
            height={64}
            src={getIconUrl(item.icon)}
            unoptimized
            width={64}
          />
        ) : (
          <Image
            alt={item.type}
            className="size-16"
            height={64}
            src={getIcon(item.type)}
            width={64}
          />
        )}

        {item.icon ? (
          <div className="absolute right-0 bottom-0 flex rounded-full bg-accent-2 p-1">
            <Image
              alt={item.type}
              className="size-4"
              height={32}
              src={getIcon(item.type)}
              width={32}
            />
          </div>
        ) : null}
      </aside>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex gap-2">
          <div className="text-pretty font-bold">{item.name}</div>

          {item.type === 'building' || item.type === 'chain' ? (
            <div className="flex gap-2">
              {item.regions.map((region) => (
                <Image
                  alt={region}
                  height={24}
                  key={region}
                  src={getIcon(region)}
                  title={region}
                  width={24}
                />
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

function getUrl(type: SearchType, id: number, name?: string) {
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

  return `/${base}/${id}`
}
