import { type Product } from '@anno/db/client'

import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { Icon } from '../common/icon'

type Props = {
  product: Product
}

export function ProductCard({ product }: Props) {
  return (
    <NavLink
      className="relative flex flex-col gap-4 rounded-lg p-4 outline-none ring-accent-8 hover:bg-accent-4 focus-visible:ring-2"
      href={getUrl('product', product.guid, product.name)}
    >
      {product.icon ? <Icon className="size-16" icon={product.icon} /> : null}

      <div className="font-bold">{product.name}</div>

      {product.regions.length || product.dlc?.key ? (
        <div className="pointer-events-none absolute top-4 right-4 flex gap-2">
          {product.regions.map((region) =>
            region.key ? (
              <Icon
                className="size-6"
                icon={getIcon(`region.${region.key}`)}
                key={region.key}
              />
            ) : null,
          )}

          {product.dlc?.key ? (
            <Icon className="size-6" icon={getIcon(`dlc.${product.dlc.key}`)} />
          ) : null}
        </div>
      ) : null}
    </NavLink>
  )
}
