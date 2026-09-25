import { type Chain } from '@anno/db/client'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { ChainCard } from './chain'

type Props = {
  chain: Chain
}

export function ChainPage({ chain }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {chain.region?.key || chain.dlc?.key ? (
            <div className="flex gap-4">
              {chain.region?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`region.${chain.region.key}`)}
                />
              ) : null}

              {chain.dlc?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`dlc.${chain.dlc.key}`)}
                />
              ) : null}
            </div>
          ) : null}

          <h1 className="text-4xl leading-tight">{chain.name}</h1>
        </div>

        {chain.icon ? (
          <Icon className="size-50 lg:size-32" icon={chain.icon} />
        ) : null}
      </div>

      <ChainCard chain={chain} />

      <CommentList guid={chain.guid} />
    </div>
  )
}
