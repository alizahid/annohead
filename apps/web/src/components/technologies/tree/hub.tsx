import { type TechCategories } from '@anno/db/client'
import { Popover } from '@base-ui/react/popover'

import { Icon } from '../../common/icon'
import { HUB_SIZE } from './helpers'
import { techPopover } from './tooltip/popover'

type Props = {
  category: TechCategories[number]
  left: number
  top: number
}

export function Hub({ category, left, top }: Props) {
  return (
    <Popover.Trigger
      closeDelay={0}
      delay={0}
      handle={techPopover}
      nativeButton={false}
      openOnHover
      payload={{
        category,
        kind: 'category',
      }}
      render={
        <div
          className="absolute overflow-hidden rounded-full bg-gray-3 outline-hidden"
          id={`tech-category-${category.guid}`}
          style={{
            height: HUB_SIZE,
            left,
            top,
            width: HUB_SIZE,
          }}
        />
      }
    >
      {category.artwork ? (
        <Icon
          className="size-full object-cover"
          icon={category.artwork}
          size={HUB_SIZE}
        />
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gray-3/90 px-4 pt-2 pb-5">
        <div className="font-bold text-sm">{category.name}</div>

        {category.icon ? (
          <Icon className="size-8" icon={category.icon} />
        ) : null}
      </div>
    </Popover.Trigger>
  )
}
