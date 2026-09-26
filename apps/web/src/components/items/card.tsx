import { type Item } from '@anno/db/client'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'
import { ItemIcon } from './icon'

type Props = {
  item: Item
}

export function ItemCard({ item }: Props) {
  return (
    <NavLink
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('item', item.guid, item.slug)}
    >
      <ItemIcon icon={item.icon} rarity={item.rarity?.key} />

      <div className="flex flex-col">
        <div className="font-bold">{item.name}</div>

        {item.type ? (
          <div className="text-gray-11 text-sm">{item.type.name}</div>
        ) : null}
      </div>

      {(item.type && item.type.key !== 'None') || item.dlc?.key ? (
        <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
          {item.type && item.type.key !== 'None' ? (
            <Icon className="size-6" icon={getIcon(`type.${item.type.key}`)} />
          ) : null}

          {item.dlc?.key ? (
            <Icon className="size-6" icon={getIcon(`dlc.${item.dlc.key}`)} />
          ) : null}
        </div>
      ) : null}
    </NavLink>
  )
}
