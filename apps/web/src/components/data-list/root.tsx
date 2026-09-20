import { cn } from 'cn'
import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  title: string
}

export function Root({ children, className, title }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg bg-gray-2 p-4 pb-3',
        className,
      )}
    >
      <div className="font-bold text-sm leading-tight">{title}</div>

      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
