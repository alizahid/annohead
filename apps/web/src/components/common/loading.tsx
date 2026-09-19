import { Spinner } from './spinner'

export function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner className="size-8 animate-spin" />
    </div>
  )
}
