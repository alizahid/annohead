import { type Unit } from '@anno/db/client'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  unit: Unit
}

export function UnitCard({ unit }: Props) {
  return (
    <NavLink
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('unit', unit.guid, unit.slug)}
    >
      {unit.icon ? <Icon className="size-16" icon={unit.icon} /> : null}

      <div className="flex flex-col">
        <div className="font-bold">{unit.name}</div>

        {unit.type ? (
          <div className="text-gray-11 text-sm">{unit.type.name}</div>
        ) : null}
      </div>

      {unit.region?.key ? (
        <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
          <Icon
            className="size-6"
            icon={getIcon(`region.${unit.region.key}`)}
          />
        </div>
      ) : null}
    </NavLink>
  )
}
