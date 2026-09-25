'use client'

import { type TechCategories, type Techs } from '@anno/db/client'
import { Popover } from '@base-ui/react/popover'
import { cn } from 'cn'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { NavLink } from '@/intl/nav'
import { getUrl } from '@/lib/url'

import { Icon } from '../../common/icon'
import { Controls } from './controls'
import { GATE_SIZE, HUB_SIZE, layout, TECH_SIZE } from './helpers'
import { Hub } from './hub'
import { TechPopover, techPopover } from './tooltip/popover'

// screen pixels around the hubs when the tree opens
const HUB_PADDING = 50

type Props = {
  categories: TechCategories
  techs: Techs
}

export function TechTree({ categories, techs }: Props) {
  const tree = layout(categories, techs)

  return (
    <TransformWrapper
      limitToBounds
      maxScale={2}
      minScale={0.5}
      onInit={(ref) => {
        const wrapper = ref.instance.wrapperComponent

        if (!wrapper) {
          return
        }

        const { height, left, top, width } = tree.hubBounds
        const scale = Math.min(
          (wrapper.clientWidth - HUB_PADDING * 2) / width,
          (wrapper.clientHeight - HUB_PADDING * 2) / height,
        )

        ref.setTransform(
          (wrapper.clientWidth - width * scale) / 2 - left * scale,
          (wrapper.clientHeight - height * scale) / 2 - top * scale,
          scale,
          0,
        )
      }}
    >
      <div className="relative h-screen select-none overflow-hidden rounded-2xl bg-gray-2 lg:h-[calc(100vh-(--spacing(6))-(--spacing(10))-(--spacing(4))-(--spacing(10))-(--spacing(12))-(--spacing(12))-(--spacing(4))-(--spacing(6)))]">
        <TransformComponent
          wrapperStyle={{
            height: '100%',
            width: '100%',
          }}
        >
          <div
            className="relative"
            style={{
              height: tree.height,
              width: tree.width,
            }}
          >
            <svg
              aria-hidden
              className="absolute inset-0 stroke-gray-6"
              height={tree.height}
              strokeWidth={3}
              viewBox={`${tree.minX} ${tree.minY} ${tree.width} ${tree.height}`}
              width={tree.width}
            >
              {tree.lines.map(([from, to]) => (
                <line
                  key={`${from.x}:${from.y}:${to.x}:${to.y}`}
                  x1={from.x}
                  x2={to.x}
                  y1={from.y}
                  y2={to.y}
                />
              ))}
            </svg>

            {tree.hubs.map((hub) => (
              <Hub
                category={hub}
                key={hub.guid}
                left={hub.x - tree.minX - HUB_SIZE / 2}
                top={hub.y - tree.minY - HUB_SIZE / 2}
              />
            ))}

            {tree.nodes.map((node) => {
              const size = node.isGate ? GATE_SIZE : TECH_SIZE

              return (
                <Popover.Trigger
                  closeDelay={0}
                  delay={0}
                  handle={techPopover}
                  key={node.guid}
                  nativeButton={false}
                  openOnHover
                  payload={{
                    kind: 'tech',
                    tech: node,
                  }}
                  render={
                    <NavLink
                      className={cn(
                        'absolute flex items-center justify-center rounded-full outline-none ring-accent-8 transition-colors hover:bg-accent-4 focus-visible:ring-2',
                        node.isGate ? 'bg-gray-5' : 'bg-gray-3',
                      )}
                      href={getUrl('tech', node.guid, node.name)}
                      style={{
                        height: size,
                        left: node.x - tree.minX - size / 2,
                        top: node.y - tree.minY - size / 2,
                        width: size,
                      }}
                    />
                  }
                >
                  {node.icon ? (
                    <Icon className="size-12" icon={node.icon} />
                  ) : null}
                </Popover.Trigger>
              )
            })}
          </div>
        </TransformComponent>

        <Controls categories={tree.hubs} />

        <TechPopover />
      </div>
    </TransformWrapper>
  )
}
