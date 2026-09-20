import { cn } from 'cn'
import { useFormatter } from 'next-intl'

import { Icon } from '../common/icon'

type Props = {
  icon?: string | null
  name: string | null
  tier?: boolean
  value?: string | number | null
}

export function Item({ name, icon, tier, value }: Props) {
  const f = useFormatter()

  return (
    <div className="flex items-center justify-between gap-4 rounded-sm py-1">
      <div className="flex flex-1 items-center gap-2">
        {icon ? (
          <Icon
            className={cn('size-6', tier && 'rounded-full bg-gray-3')}
            icon={icon}
          />
        ) : null}

        <div className="text-sm">{name}</div>
      </div>

      {value ? (
        <div className="text-sm tabular-nums">
          {typeof value === 'number' ? f.number(value) : null}

          {typeof value === 'string' ? value : null}
        </div>
      ) : null}
    </div>
  )
}
