import { type SearchType } from '@anno/db/search'
import { useFormatter } from 'next-intl'
import { type ReactNode } from 'react'

import { NavLink } from '@/intl/nav'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  description?: string | null
  icon?: string | null
  id: number
  name: string | null
  type: SearchType
  value?: ReactNode | string | number | null
}

export function Link({ description, icon, id, name, type, value }: Props) {
  const f = useFormatter()

  return (
    <NavLink
      className="-mx-4 flex items-center justify-between gap-4 rounded-sm px-4 py-1 outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl(type, id, name)}
    >
      <div className="flex flex-1 items-center gap-2">
        {icon ? <Icon className="size-6" icon={icon} /> : null}

        <div className="flex flex-1 flex-col gap-1">
          <div className="text-sm">{name}</div>

          {description ? (
            <div className="text-gray-11 text-xs">{description}</div>
          ) : null}
        </div>
      </div>

      {typeof value === 'string' || typeof value === 'number' ? (
        <div className="grow-0 truncate text-sm tabular-nums">
          {typeof value === 'number' ? f.number(value) : null}

          {typeof value === 'string' ? value : null}
        </div>
      ) : null}

      {typeof value !== 'string' && typeof value !== 'number' ? value : null}
    </NavLink>
  )
}
