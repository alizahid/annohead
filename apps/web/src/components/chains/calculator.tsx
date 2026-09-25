'use client'

import { type Chain } from '@anno/db/client'
import { NumberField } from '@base-ui/react/number-field'
import {
  ArrowsHorizontalIcon,
  MinusIcon,
  PlusIcon,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from 'cn'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

type Props = {
  chain: Chain
  variant?: 'full' | 'mini'
}

export function Calculator({ chain, variant = 'full' }: Props) {
  const t = useTranslations('component.chains.calculator')
  const f = useFormatter()

  const [count, setCount] = useState(1)

  const output =
    (60 / (chain.building?.cycleTime ?? 60)) *
    count *
    ((chain.building?.baseProductivity ?? 100) / 100)

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        variant === 'full' && 'rounded-lg bg-gray-2 p-4',
      )}
    >
      {variant === 'full' ? (
        <div className="font-bold text-sm">{t('title')}</div>
      ) : null}

      <NumberField.Root
        className="flex justify-between gap-4"
        id={`chain-${chain.guid}`}
        min={1}
        onClick={(event) => {
          event.preventDefault()
        }}
        onValueChange={(next) => {
          setCount(next ?? 1)
        }}
        value={count}
      >
        <NumberField.ScrubArea>
          <label className="cursor-ew-resize" htmlFor={`chain-${chain.guid}`}>
            {t('count', {
              name: chain.name ?? 'building',
            })}
          </label>

          <NumberField.ScrubAreaCursor>
            <ArrowsHorizontalIcon className="size-6" />
          </NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>

        <NumberField.Group className="flex gap-2">
          <NumberField.Decrement
            className={cn(
              'flex size-6 items-center justify-center rounded-sm transition-colors',
              variant === 'mini' && 'hover:bg-accent-5 active:bg-accent-6',
              variant === 'full' && 'hover:bg-accent-4 active:bg-accent-5',
            )}
          >
            <MinusIcon />
          </NumberField.Decrement>

          <NumberField.Input className="w-12 rounded-sm px-1 text-sm tabular-nums outline-none ring-accent-8 focus-visible:ring-2" />

          <NumberField.Increment
            className={cn(
              'flex size-6 items-center justify-center rounded-sm transition-colors',
              variant === 'mini' && 'hover:bg-accent-5 active:bg-accent-6',
              variant === 'full' && 'hover:bg-accent-4 active:bg-accent-5',
            )}
          >
            <PlusIcon />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>

      {variant === 'full' ? (
        <div className="flex justify-between gap-4">
          <div>{t('cycleTime')}</div>

          {chain.building?.cycleTime ? (
            <div className="tabular-nums">
              {f.number(chain.building.cycleTime, {
                style: 'unit',
                unit: 'second',
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {variant === 'full' ? (
        <div className="flex justify-between gap-4">
          <div>{t('baseProductivity')}</div>

          {chain.building?.baseProductivity ? (
            <div className="tabular-nums">
              {f.number(chain.building.baseProductivity / 100, {
                style: 'percent',
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-between gap-4">
        <div>{t('output')}</div>

        <div className="tabular-nums">
          {t(
            'tons',
            {
              tons: output,
            },
            {
              number: {
                tons: {
                  maximumFractionDigits: 2,
                },
              },
            },
          )}
        </div>
      </div>

      {variant === 'full' ? (
        <div className="mt-4 font-bold text-sm">{t('inputs')}</div>
      ) : null}

      <div
        className={cn(
          'flex gap-4',
          variant === 'mini' && 'flex-wrap',
          variant === 'full' && 'flex-col',
        )}
      >
        {chain.nodes
          .filter((node) => Boolean(node.parentId))
          .map((node) => (
            <div className="flex justify-between gap-2" key={node.id}>
              <div>{node.name}</div>

              <div className="tabular-nums">
                {t.rich(
                  'buildings',
                  {
                    required:
                      (output * (node.cycleTime ?? 60)) /
                      60 /
                      ((node.baseProductivity ?? 100) / 100),
                  },
                  {
                    number: {
                      required: {
                        maximumFractionDigits: 0,
                      },
                    },
                  },
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
