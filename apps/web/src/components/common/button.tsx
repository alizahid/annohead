import { type ButtonProps, Button as Component } from '@base-ui/react/button'
import { CircleNotchIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from 'cn'

type Props = ButtonProps & {
  loading?: boolean
}

export function Button({
  children,
  className,
  disabled,
  loading,
  ...props
}: Props) {
  return (
    <Component
      {...props}
      className={cn(
        'textbase flex h-10 items-center justify-center gap-3 rounded-lg bg-accent-9 px-3 font-bold text-accent-contrast outline-accent-8 outline-offset-4 enabled:active:bg-accent-9 enabled:hover:bg-accent-10',
        loading && 'cursor-progress',
        className,
      )}
      disabled={disabled || loading}
    >
      {children}

      {loading ? (
        <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
      ) : null}
    </Component>
  )
}
