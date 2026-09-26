import { type Product } from '@anno/db/client'
import { useTranslations } from 'next-intl'

import { getIcon } from '@/lib/icons'
import { getUrl } from '@/lib/url'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { DataList } from '../data-list'

type Props = {
  product: Product
}

export function ProductPage({ product }: Props) {
  const t = useTranslations('component.products.page')

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {product.regions.length || product.dlc?.key ? (
            <div className="flex gap-4">
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
                <Icon
                  className="size-6"
                  icon={getIcon(`dlc.${product.dlc.key}`)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {product.type ? (
              <div className="text-gray-11 text-sm">{product.type.name}</div>
            ) : null}

            <h1 className="text-4xl leading-tight">{product.name}</h1>
          </div>
        </div>

        {product.icon ? (
          <Icon className="size-50 lg:size-32" icon={product.icon} />
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col gap-6 empty:hidden">
          {product.producedBy.length ? (
            <DataList.Root title={t('produced')}>
              {product.producedBy.map((item) => (
                <DataList.Link
                  href={getUrl('building', item.guid, item.slug)}
                  icon={item.icon}
                  key={item.guid}
                  name={item.name}
                  value={
                    item.region?.key ? (
                      <Icon
                        className="size-5"
                        icon={getIcon(`region.${item.region.key}`)}
                      />
                    ) : null
                  }
                />
              ))}
            </DataList.Root>
          ) : null}

          {product.consumedBy.length ? (
            <DataList.Root title={t('consumed')}>
              {product.consumedBy.map((item) => (
                <DataList.Link
                  href={getUrl('building', item.guid, item.slug)}
                  icon={item.icon}
                  key={item.guid}
                  name={item.name}
                  value={
                    item.region?.key ? (
                      <Icon
                        className="size-5"
                        icon={getIcon(`region.${item.region.key}`)}
                      />
                    ) : null
                  }
                />
              ))}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          {product.neededBy.length ? (
            <DataList.Root title={t('needed')}>
              {product.neededBy.map((item) => (
                <DataList.Item
                  icon={item.icon}
                  key={item.guid}
                  name={item.name}
                  value={
                    item.consumptionRate
                      ? t('tons', {
                          tons: item.consumptionRate,
                        })
                      : undefined
                  }
                />
              ))}
            </DataList.Root>
          ) : null}

          {product.wantedBy.length ? (
            <DataList.Root title={t('wanted')}>
              {product.wantedBy.map((item) => (
                <DataList.Item
                  icon={item.icon}
                  key={item.guid}
                  name={item.name}
                  value={
                    item.consumptionRate
                      ? t('tons', {
                          tons: item.consumptionRate,
                        })
                      : undefined
                  }
                />
              ))}
            </DataList.Root>
          ) : null}
        </div>
      </div>

      <CommentList guid={product.guid} />
    </div>
  )
}
