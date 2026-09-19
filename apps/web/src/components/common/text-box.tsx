import { Input, type InputProps } from '@base-ui/react/input'
import { cn } from 'cn'

type Props = InputProps

export function TextBox({ className, ...props }: Props) {
  return (
    <Input
      {...props}
      className={cn(
        'h-10 min-w-3xs rounded-lg bg-gray-3 px-3 outline-none ring-accent-8 focus-visible:ring-2',
        className,
      )}
    />
  )
}
