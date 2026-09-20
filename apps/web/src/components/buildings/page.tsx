import { type Building } from '@anno/db/client'
import { useFormatter, useTranslations } from 'next-intl'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { DataList } from '../data-list'

type Props = {
  building: Building
}

export function BuildingPage({ building }: Props) {
  const t = useTranslations('component.buildings.page')
  const f = useFormatter()

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-between">
        <div className="flex gap-4 lg:flex-row lg:items-start">
          {building.region?.key || building.dlc?.key ? (
            <div className="flex flex-col gap-4">
              {building.region?.key ? (
                <Icon className="size-6" icon={getIcon(building.region.key)} />
              ) : null}

              {building.dlc?.key ? (
                <Icon className="size-6" icon={getIcon(building.dlc.key)} />
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-2">
            {building.kind ? (
              <div className="text-gray-11 text-sm">{building.kind.name}</div>
            ) : null}

            <h1 className="text-2xl leading-tight">{building.name}</h1>

            {building.description ? <p>{building.description}</p> : null}
          </div>
        </div>

        {building.icon ? (
          <Icon className="size-32" icon={building.icon} />
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {building.costs.length ? (
          <DataList.Root title={t('construction')}>
            {building.costs.map((item) => (
              <DataList.Link
                icon={item.icon}
                id={item.guid}
                key={item.guid}
                name={item.name}
                type="product"
                value={item.amount}
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.maintenance.length ? (
          <DataList.Root title={t('maintenance')}>
            {building.maintenance.map((item) => (
              <DataList.Item
                icon={item.icon}
                key={item.guid}
                name={item.name}
                value={item.amount}
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.inputs.length ? (
          <DataList.Root title={t('inputs')}>
            {building.inputs.map((item) => (
              <DataList.Link
                icon={item.icon}
                id={item.guid}
                key={item.guid}
                name={item.name}
                type="product"
                value={item.amount}
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.outputs.length ? (
          <DataList.Root title={t('outputs')}>
            {building.outputs.map((item) => (
              <DataList.Link
                icon={item.icon}
                id={item.guid}
                key={item.guid}
                name={item.name}
                type="product"
                value={item.amount}
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.workforce.length ? (
          <DataList.Root title={t('workforce')}>
            {building.workforce.map((item) => (
              <DataList.Item
                icon={item.icon}
                key={item.guid}
                name={item.name}
                value={item.amount}
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.effects.length ? (
          <DataList.Root title={t('effects')}>
            {building.effects.map((item) => (
              <DataList.Item
                icon={item.attribute ? getIcon(item.attribute) : null}
                key={`${item.buildingGuid}:${item.attribute}`}
                name={item.name}
                value={
                  item.value
                    ? f.number(item.isPercent ? item.value / 100 : item.value, {
                        signDisplay: 'always',
                        style: item.isPercent ? 'percent' : undefined,
                      })
                    : undefined
                }
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.buffs.length ? (
          <DataList.Root title={t('buffs')}>
            {building.buffs.map((item) => (
              <DataList.Item
                icon={item.attribute ? getIcon(item.attribute) : undefined}
                key={`${item.buildingGuid}:${item.attribute}`}
                name={item.name}
                value={
                  item.value
                    ? f.number(item.value, {
                        signDisplay: 'always',
                      })
                    : undefined
                }
              />
            ))}
          </DataList.Root>
        ) : null}

        {building.unlockedBy.length ? (
          <DataList.Root title={t('unlocked')}>
            {building.unlockedBy.map((item) => (
              <DataList.Link
                icon={item.icon}
                id={item.guid}
                key={item.guid}
                name={item.name}
                type="tech"
              />
            ))}
          </DataList.Root>
        ) : null}

        <DataList.Root title={t('other.title')}>
          {building.baseProductivity ? (
            <DataList.Item
              name={t('other.baseProductivity')}
              value={f.number(building.baseProductivity / 100, {
                style: 'percent',
              })}
            />
          ) : null}

          {building.cycleTime ? (
            <DataList.Item
              name={t('other.cycleTime')}
              value={f.number(building.cycleTime, {
                style: 'unit',
                unit: 'second',
              })}
            />
          ) : null}

          {building.radius ? (
            <DataList.Item name={t('other.radius')} value={building.radius} />
          ) : null}

          {building.transporterRange ? (
            <DataList.Item
              name={t('other.transporterRange')}
              value={building.transporterRange}
            />
          ) : null}

          {building.streetRadius ? (
            <DataList.Item
              name={t('other.streetRadius')}
              value={building.streetRadius}
            />
          ) : null}

          {building.category ? (
            <DataList.Item
              name={t('other.category')}
              value={building.category}
            />
          ) : null}

          {building.template ? (
            <DataList.Item
              name={t('other.template')}
              value={building.template}
            />
          ) : null}
        </DataList.Root>
      </div>

      <CommentList guid={building.guid} />
    </div>
  )
}
