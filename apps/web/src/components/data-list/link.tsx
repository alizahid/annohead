import { type SearchType } from '@anno/db/search'
import { useFormatter } from 'next-intl'

import { NavLink } from '@/intl/nav'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  icon?: string | null
  id: number
  name: string | null
  type: SearchType
  value?: string | number | null
}

export function Link({ id, name, type, icon, value }: Props) {
  const f = useFormatter()

  return (
    <NavLink
      className="flex items-center justify-between gap-4 rounded-sm outline-none ring-accent-8 ring-offset-4 ring-offset-gray-2 focus-visible:ring-2"
      href={getUrl(type, id, name)}
    >
      <div className="flex flex-1 items-center gap-2">
        {icon ? <Icon className="size-6" icon={icon} /> : null}

        <div className="text-sm">{name}</div>
      </div>

      {value ? (
        <div className="text-sm tabular-nums">
          {typeof value === 'number' ? f.number(value) : null}

          {typeof value === 'string' ? value : null}
        </div>
      ) : null}
    </NavLink>
  )
}
