import { type Building } from '@anno/db/client'
import { compact } from 'lodash'
import { useFormatter, useTranslations } from 'next-intl'

import { getIcon } from '@/lib/icons'

import { CommentList } from '../comments/list'
import { Icon } from '../common/icon'
import { Box } from './box'

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
          <Box
            items={building.costs.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
              value: item.amount,
            }))}
            title={t('construction')}
            type="product"
          />
        ) : null}

        {building.maintenance.length ? (
          <Box
            items={building.maintenance.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
              value: item.amount,
            }))}
            title={t('maintenance')}
          />
        ) : null}

        {building.inputs.length ? (
          <Box
            items={building.inputs.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
              value: item.amount,
            }))}
            title={t('inputs')}
            type="product"
          />
        ) : null}

        {building.outputs.length ? (
          <Box
            items={building.outputs.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
              value: item.amount,
            }))}
            title={t('outputs')}
            type="product"
          />
        ) : null}

        {building.workforce.length ? (
          <Box
            items={building.workforce.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
              value: item.amount,
            }))}
            title={t('workforce')}
          />
        ) : null}

        {building.effects.length ? (
          <Box
            items={building.effects.map((item) => ({
              icon: item.attribute ? getIcon(item.attribute) : null,
              id: item.buffGuid,
              name: item.name,
              value: item.value
                ? f.number(item.isPercent ? item.value / 100 : item.value, {
                    signDisplay: 'always',
                    style: item.isPercent ? 'percent' : undefined,
                  })
                : null,
            }))}
            title={t('effects')}
          />
        ) : null}

        {building.buffs.length ? (
          <Box
            items={building.buffs.map((item) => ({
              icon: item.attribute ? getIcon(item.attribute) : null,
              id: `${item.buildingGuid}:${item.attribute}`,
              name: item.name,
              value: item.value
                ? f.number(item.value, {
                    signDisplay: 'always',
                  })
                : null,
            }))}
            title={t('buffs')}
          />
        ) : null}

        {building.unlockedBy.length ? (
          <Box
            items={building.unlockedBy.map((item) => ({
              icon: item.icon,
              id: item.guid,
              name: item.name,
            }))}
            title={t('unlocked')}
            type="tech"
          />
        ) : null}

        <Box
          items={compact([
            building.baseProductivity && {
              icon: null,
              id: 'baseProductivity',
              name: t('other.baseProductivity'),
              value: f.number(building.baseProductivity / 100, {
                style: 'percent',
              }),
            },
            building.cycleTime && {
              icon: null,
              id: 'cycleTime',
              name: t('other.cycleTime'),
              value: f.number(building.cycleTime, {
                style: 'unit',
                unit: 'second',
              }),
            },
            building.radius && {
              icon: null,
              id: 'radius',
              name: t('other.radius'),
              value: building.radius,
            },
            building.transporterRange && {
              icon: null,
              id: 'transporterRange',
              name: t('other.transporterRange'),
              value: building.transporterRange,
            },
            building.streetRadius && {
              icon: null,
              id: 'streetRadius',
              name: t('other.streetRadius'),
              value: building.streetRadius,
            },
            building.category && {
              icon: null,
              id: 'category',
              name: t('other.category'),
              value: building.category,
            },
            building.template && {
              icon: null,
              id: 'template',
              name: t('other.template'),
              value: building.template,
            },
          ])}
          title={t('other.title')}
        />
      </div>

      <CommentList guid={building.guid} />
    </div>
  )
}
