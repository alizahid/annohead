'use client'

import { type TechCategories } from '@anno/db/client'
import {
  ArrowsInIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@phosphor-icons/react'
import { useControls } from 'react-zoom-pan-pinch'

import { Icon } from '../../common/icon'
import { IconButton } from '../../common/icon-button'

type Props = {
  categories: TechCategories
}

export function Controls({ categories }: Props) {
  const { fitToView, zoomIn, zoomOut, zoomToElement } = useControls()

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <IconButton
            className="pointer-events-auto bg-gray-3 enabled:hover:bg-gray-4"
            key={category.guid}
            onClick={() => {
              zoomToElement(`tech-category-${category.guid}`, 0.6)
            }}
          >
            {category.icon ? (
              <Icon className="size-7" icon={category.icon} />
            ) : null}
          </IconButton>
        ))}
      </div>

      <div className="flex gap-2">
        <IconButton
          className="pointer-events-auto bg-gray-3 enabled:hover:bg-gray-4"
          onClick={() => zoomOut()}
        >
          <MagnifyingGlassMinusIcon className="size-5 text-gray-12" />
        </IconButton>

        <IconButton
          className="pointer-events-auto bg-gray-3 enabled:hover:bg-gray-4"
          onClick={() => zoomIn()}
        >
          <MagnifyingGlassPlusIcon className="size-5 text-gray-12" />
        </IconButton>

        <IconButton
          className="pointer-events-auto bg-gray-3 enabled:hover:bg-gray-4"
          onClick={() => fitToView()}
        >
          <ArrowsInIcon className="size-5 text-gray-12" />
        </IconButton>
      </div>
    </div>
  )
}
