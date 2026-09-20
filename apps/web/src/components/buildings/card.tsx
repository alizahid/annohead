import { type Building } from '@anno/db/client'

import { Link } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  building: Building
}

export function BuildingCard({ building }: Props) {
  return (
    <Link
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('building', building.guid, building.name)}
    >
      {building.icon ? <Icon className="size-16" icon={building.icon} /> : null}

      <div className="flex flex-col">
        <div className="font-bold">{building.name}</div>

        {building.kind ? (
          <div className="text-gray-11 text-sm">{building.kind.name}</div>
        ) : null}

        {building.region?.key || building.dlc?.key ? (
          <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
            {building.region?.key ? (
              <Icon className="size-6" icon={getIcon(building.region.key)} />
            ) : null}

            {building.dlc?.key ? (
              <Icon className="size-6" icon={getIcon(building.dlc.key)} />
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
