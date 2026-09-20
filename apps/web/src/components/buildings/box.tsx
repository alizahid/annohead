import { type SearchType } from '@anno/db/search'
import { useFormatter } from 'next-intl'

import { Link } from '@/intl/nav'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  title: string
  type?: SearchType
  items: Array<{
    id: number | string
    name: string | null
    icon: string | null
    value?: string | number | null
  }>
}

export function Box({ title, items, type }: Props) {
  const f = useFormatter()

  const Component = type ? Link : 'div'

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-gray-2 p-4">
      <div className="font-bold text-sm leading-tight">{title}</div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Component
            className="flex items-center justify-between gap-4 rounded-sm outline-none ring-accent-8 ring-offset-4 ring-offset-gray-2 focus-visible:ring-2"
            href={
              type
                ? getUrl(type, item.id as number, item.name)
                : (undefined as unknown as string)
            }
            key={item.id}
          >
            <div className="flex flex-1 items-center gap-2">
              {item.icon ? <Icon className="size-6" icon={item.icon} /> : null}

              <div className="text-sm">{item.name}</div>
            </div>

            {item.value ? (
              <div className="text-sm tabular-nums">
                {typeof item.value === 'number'
                  ? f.number(item.value)
                  : item.value}
              </div>
            ) : null}
          </Component>
        ))}
      </div>
    </div>
  )
}
