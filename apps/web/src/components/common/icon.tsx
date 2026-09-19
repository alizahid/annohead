import { cn } from 'cn'
import Image from 'next/image'

import { getIconUrl } from '@/lib/icons'

type Props = {
  className?: string
  icon: string
}

export function Icon({ className, icon }: Props) {
  return (
    <Image
      alt={icon}
      className={cn('size-16', className)}
      height={64}
      src={icon.startsWith('/img/') ? icon : getIconUrl(icon)}
      unoptimized={!icon.startsWith('/img/')}
      width={64}
    />
  )
}
