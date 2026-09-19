import { CircleNotchIcon } from '@phosphor-icons/react/dist/ssr'

export function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <CircleNotchIcon className="size-8 animate-spin" />
    </div>
  )
}
