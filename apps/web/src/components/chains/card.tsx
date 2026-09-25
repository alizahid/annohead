import { type Chain } from '@anno/db/client'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'
import { Calculator } from './calculator'

type Props = {
  chain: Chain
}

export function ChainCard({ chain }: Props) {
  return (
    <NavLink
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('chain', chain.guid, chain.name)}
    >
      {chain.icon ? <Icon className="size-16" icon={chain.icon} /> : null}

      <div className="font-bold">{chain.name}</div>

      {chain.region?.key || chain.dlc?.key ? (
        <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
          {chain.region?.key ? (
            <Icon
              className="size-6"
              icon={getIcon(`region.${chain.region.key}`)}
            />
          ) : null}

          {chain.dlc?.key ? (
            <Icon className="size-6" icon={getIcon(`dlc.${chain.dlc.key}`)} />
          ) : null}
        </div>
      ) : null}

      <Calculator chain={chain} variant="mini" />
    </NavLink>
  )
}
