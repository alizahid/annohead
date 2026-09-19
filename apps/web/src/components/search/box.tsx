'use client'

import { SearchTypes } from '@anno/db/search'
import { Input } from '@base-ui/react/input'
import { Select } from '@base-ui/react/select'
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from 'cn'
import Form from 'next/form'
import { useTranslations } from 'next-intl'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useRef } from 'react'

import { usePathname } from '@/intl/nav'

type Props = {
  className?: string
}

export function SearchBox({ className }: Props) {
  const path = usePathname()

  const t = useTranslations('component.search.box')

  const form = useRef<HTMLFormElement>(null)

  const [query] = useQueryState('q')
  const [type] = useQueryState('t', parseAsStringLiteral(SearchTypes))

  const onPage = path.startsWith('/search')

  return (
    <Form
      action="/search"
      className={cn('flex justify-center gap-4', className)}
      ref={form}
    >
      <Input
        className={cn(
          'h-10 w-full max-w-3xs rounded-full bg-gray-3 px-4 outline-none ring-accent-8 focus-visible:ring-2',
          onPage && 'rounded-lg px-3',
        )}
        defaultValue={query ?? undefined}
        name="q"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            form.current?.submit()
          }
        }}
        placeholder={t('placeholder')}
        type="search"
      />

      {onPage ? (
        <Select.Root
          defaultValue={type}
          items={SearchTypes.map((value) => ({
            label: t(`type.${value}`),
            value,
          }))}
          name="t"
          onOpenChangeComplete={(open) => {
            if (!open) {
              form.current?.submit()
            }
          }}
        >
          <Select.Trigger className="flex h-10 w-(--anchor-width) items-center gap-2 text-nowrap rounded-lg bg-gray-3 px-3 outline-none ring-accent-8 focus-visible:ring-2">
            <Select.Value placeholder={t('type.all')} />

            <Select.Icon>
              <CaretDownIcon className="text-gray-11" weight="bold" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Positioner className="z-10 select-none outline-hidden">
              <Select.Popup className="overflow-hidden rounded-lg bg-gray-2">
                <Select.List className="relative overflow-y-auto p-2">
                  <Select.Item className="grid h-8 cursor-default select-none grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-3 text-sm outline-hidden data-highlighted:bg-accent-9 data-highlighted:text-accent-contrast">
                    <Select.ItemIndicator className="col-start-1">
                      <CheckIcon weight="bold" />
                    </Select.ItemIndicator>

                    <Select.ItemText className="col-start-2">
                      {t('type.all')}
                    </Select.ItemText>
                  </Select.Item>

                  {SearchTypes.map((item) => (
                    <Select.Item
                      className="grid h-8 cursor-default select-none grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-3 text-sm outline-hidden data-highlighted:bg-accent-9 data-highlighted:text-accent-contrast0"
                      key={item}
                      value={item}
                    >
                      <Select.ItemIndicator className="col-start-1">
                        <CheckIcon weight="bold" />
                      </Select.ItemIndicator>

                      <Select.ItemText className="col-start-2">
                        {t(`type.${item}`)}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      ) : null}
    </Form>
  )
}
