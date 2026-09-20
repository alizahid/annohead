import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  title: string
}

export function Root({ children, title }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-gray-2 p-4">
      <div className="font-bold text-sm leading-tight">{title}</div>

      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
