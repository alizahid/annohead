import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  title: string
}

export function Section({ children, title }: Props) {
  return (
    <div className="flex flex-col gap-2 bg-white p-4 dark:bg-black">
      <div className="font-bold text-gray-11 text-sm">{title}</div>

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}
