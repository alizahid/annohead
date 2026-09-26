import { type Tech } from '@anno/db/client'
import { useFormatter, useTranslations } from 'next-intl'
import { Fragment } from 'react'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { DataList } from '../data-list'

type Props = {
  tech: Tech
}

export function TechnologyPage({ tech }: Props) {
  const t = useTranslations('component.technologies.page')
  const f = useFormatter()

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          {tech.region?.key || tech.dlc?.key ? (
            <div className="flex gap-4">
              {tech.region?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`region.${tech.region.key}`)}
                />
              ) : null}

              {tech.dlc?.key ? (
                <Icon
                  className="size-6"
                  icon={getIcon(`dlc.${tech.dlc.key}`)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl leading-tight">{tech.name}</h1>

            {tech.description ? <p>{tech.description}</p> : null}
          </div>
        </div>

        {tech.icon ? (
          <Icon className="size-50 lg:size-32" icon={tech.icon} />
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col gap-6 empty:hidden">
          {tech.unlocks.length ? (
            <DataList.Root title={t('unlocks')}>
              {tech.unlocks.map((item) =>
                item.buildingGuid ? (
                  <DataList.Link
                    description={item.description}
                    icon={item.icon}
                    id={item.buildingGuid}
                    key={item.guid}
                    name={item.name}
                    slug={item.slug}
                    type="building"
                  />
                ) : (
                  <DataList.Item
                    description={item.description}
                    icon={item.icon}
                    key={item.guid}
                    name={item.name}
                  />
                ),
              )}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          {tech.effects.length ? (
            <DataList.Root title={t('effects.title')}>
              {tech.effects.map((effect) => (
                <Fragment key={effect.guid}>
                  <div className="flex flex-col gap-1">
                    <div className="font-bold">{effect.name}</div>

                    {effect.description ? (
                      <div className="text-gray-11 text-sm">
                        {effect.description}
                      </div>
                    ) : null}
                  </div>

                  {effect.targets.length ? (
                    <DataList.Label>{t('effects.targets')}</DataList.Label>
                  ) : null}

                  {effect.targets.map((target) =>
                    target.kind === 'building' && target.buildingGuid ? (
                      <DataList.Link
                        icon={target.icon}
                        id={target.buildingGuid}
                        key={target.buildingGuid}
                        name={target.name}
                        slug={target.slug}
                        type="building"
                        value={
                          target.region?.key ? (
                            <Icon
                              className="size-5"
                              icon={getIcon(`region.${target.region.key}`)}
                            />
                          ) : null
                        }
                      />
                    ) : (
                      <DataList.Item
                        icon={target.icon}
                        key={target.guid}
                        name={target.name}
                        value={
                          target.region?.key ? (
                            <Icon
                              className="size-5"
                              icon={getIcon(`region.${target.region.key}`)}
                            />
                          ) : null
                        }
                      />
                    ),
                  )}

                  {effect.modifiers.length ? (
                    <DataList.Label>{t('effects.modifiers')}</DataList.Label>
                  ) : null}

                  {effect.modifiers.map((modifier) => (
                    <DataList.Item
                      key={`${modifier.buffGuid}:${modifier.attribute}:${modifier.path}`}
                      name={modifier.productName ?? modifier.name}
                      value={
                        modifier.value
                          ? f.number(
                              modifier.isPercent
                                ? modifier.value / 100
                                : modifier.value,
                              {
                                signDisplay: 'always',
                                style: modifier.isPercent
                                  ? 'percent'
                                  : undefined,
                              },
                            )
                          : undefined
                      }
                    />
                  ))}
                </Fragment>
              ))}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          {tech.resources.length ? (
            <DataList.Root title={t('rewards')}>
              {tech.resources.map((item) => (
                <DataList.Item
                  icon={item.icon}
                  key={item.guid}
                  name={item.name}
                  value={
                    item.amount
                      ? f.number(item.amount, {
                          signDisplay: 'always',
                        })
                      : null
                  }
                />
              ))}
            </DataList.Root>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 empty:hidden">
          <DataList.Root title={t('other.title')}>
            {tech.knowledgeNeeded ? (
              <DataList.Item
                icon={getIcon('attribute.Knowledge')}
                name={t('other.knowledgeNeeded')}
                value={f.number(tech.knowledgeNeeded, {
                  notation: 'compact',
                })}
              />
            ) : null}
          </DataList.Root>
        </div>
      </div>

      <CommentList guid={tech.guid} />
    </div>
  )
}
