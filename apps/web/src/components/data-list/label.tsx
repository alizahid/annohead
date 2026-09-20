import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function Label({ children }: Props) {
  return (
    <div className="not-first-of-type:mt-4 font-bold text-gray-11 text-sm">
      {children}
    </div>
  )
}
