import { type Item } from '@anno/db/client'
import { useFormatter, useTranslations } from 'next-intl'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Html } from '../common/html'
import { Icon } from '../common/icon'
import { DataList } from '../data-list'
import { ItemIcon } from './icon'

type Props = {
  item: Item
}

export function ItemPage({ item }: Props) {
  const t = useTranslations('component.items.page')
  const f = useFormatter()

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {item.type?.key === 'Captains' ||
          item.type?.key === 'Specialist' ||
          item.dlc?.key ? (
            <div className="flex gap-4">
              {item.type?.key === 'Captains' ||
              item.type?.key === 'Specialist' ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`type.${item.type.key}`)}
                />
              ) : null}

              {item.dlc?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`dlc.${item.dlc.key}`)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {item.type ? (
              <div className="text-gray-11 text-sm">{item.type.name}</div>
            ) : null}

            <h1 className="text-4xl leading-tight">{item.name}</h1>

            {item.description ? <Html>{item.description}</Html> : null}
          </div>
        </div>

        <ItemIcon
          className="size-50 lg:size-32"
          icon={item.icon}
          rarity={item.rarity?.key}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col gap-6 empty:hidden">
          {item.targets.length ? (
            <DataList.Root title={t('details.targets')}>
              {item.targets.map((target) => (
                <DataList.Link
                  icon={target.icon}
                  id={target.guid}
                  key={target.guid}
                  name={target.name}
                  type="building"
                />
              ))}
            </DataList.Root>
          ) : null}

          {item.sources.length ? (
            <DataList.Root title={t('details.sources')}>
              {item.sources.map((source) =>
                source.kind === 'tech' || source.questline ? (
                  <DataList.Link
                    icon={source.icon}
                    id={source.questline ?? source.guid}
                    key={`${source.guid}:${source.kind}`}
                    name={source.name}
                    type={source.questline ? 'quest' : 'tech'}
                  />
                ) : (
                  <DataList.Item
                    icon={source.icon}
                    key={`${source.guid}:${source.kind}`}
                    name={source.name}
                  />
                ),
              )}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          {item.modifiers.length ? (
            <DataList.Root title={t('details.modifiers')}>
              {item.modifiers.map((modifier) => (
                <DataList.Item
                  icon={
                    modifier.attribute
                      ? getIcon(`attribute.${modifier.attribute}`)
                      : null
                  }
                  key={modifier.path}
                  name={modifier.name}
                  value={
                    modifier.value
                      ? f.number(
                          modifier.isPercent
                            ? modifier.value / 100
                            : modifier.value,

                          {
                            signDisplay: 'always',
                            style: modifier.isPercent ? 'percent' : undefined,
                          },
                        )
                      : undefined
                  }
                />
              ))}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          {item.boost ? (
            <DataList.Root title={item.boost.hint ?? t('boost.title')}>
              {item.boost.conditions.length ? (
                <DataList.Label>{t('boost.conditions')}</DataList.Label>
              ) : null}

              {item.boost.conditions.map((condition) => (
                <DataList.Item
                  icon={condition.icon}
                  key={condition.type}
                  name={condition.name}
                  value={
                    condition.value ? f.number(condition.value) : undefined
                  }
                />
              ))}

              {item.boost.modifiers.length ? (
                <DataList.Label>{t('boost.modifiers')}</DataList.Label>
              ) : null}

              {item.boost.modifiers.map((boost) => (
                <DataList.Item
                  icon={
                    boost.attribute
                      ? getIcon(`attribute.${boost.attribute}`)
                      : null
                  }
                  key={boost.path}
                  name={boost.name}
                  value={
                    boost.value
                      ? f.number(
                          boost.isPercent ? boost.value / 100 : boost.value,
                          {
                            signDisplay: 'always',
                            style: boost.isPercent ? 'percent' : undefined,
                          },
                        )
                      : undefined
                  }
                />
              ))}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          <DataList.Root title={t('other.title')}>
            {item.allocation ? (
              <DataList.Item
                code
                name={t('other.allocation')}
                value={item.allocation}
              />
            ) : null}

            {item.tradePrice ? (
              <DataList.Item
                icon={getIcon('attribute.Money')}
                name={t('other.tradePrice')}
                value={f.number(item.tradePrice)}
              />
            ) : null}
          </DataList.Root>
        </div>
      </div>

      <CommentList guid={item.guid} />
    </div>
  )
}
