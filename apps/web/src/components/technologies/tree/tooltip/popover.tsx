'use client'

import { type TechCategories, type Techs } from '@anno/db/client'
import { Popover } from '@base-ui/react/popover'

import { CategoryCard } from './category'
import { TechCard } from './tech'

type Payload =
  | {
      category: TechCategories[number]
      kind: 'category'
    }
  | {
      kind: 'tech'
      tech: Techs[number]
    }

export const techPopover = Popover.createHandle<Payload>()

export function TechPopover() {
  return (
    <Popover.Root handle={techPopover}>
      {({ payload }) =>
        payload ? (
          <Popover.Portal>
            <Popover.Positioner
              collisionPadding={16}
              side="right"
              sideOffset={12}
            >
              <Popover.Popup className="flex w-80 max-w-80 flex-col overflow-hidden rounded-2xl bg-gray-1 outline-hidden">
                {payload.kind === 'tech' ? (
                  <TechCard tech={payload.tech} />
                ) : (
                  <CategoryCard category={payload.category} />
                )}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        ) : null
      }
    </Popover.Root>
  )
}
