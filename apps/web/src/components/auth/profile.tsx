import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from '@convex-dev/auth/react'
import { UserCircleDashedIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from 'cn'
import Image from 'next/image'

import { Spinner } from '@/components/common/spinner'
import { Link } from '@/intl/nav'
import { getIcon } from '@/lib/icons'

type Props = {
  className?: string
}

export function AuthProfile({ className }: Props) {
  return (
    <div
      className={cn(
        'flex size-10 items-center justify-center rounded-lg outline-none ring-accent-8 focus-within:ring-2 focus-visible:ring-2',
        className,
      )}
    >
      <AuthLoading>
        <Spinner className="size-6" />
      </AuthLoading>

      <Authenticated>
        <Link className="outline-none" href="/auth/profile">
          <Image
            alt="Profile"
            className="size-6"
            height={64}
            src={getIcon('profile')}
            width={64}
          />
        </Link>
      </Authenticated>

      <Unauthenticated>
        <Link className="outline-none" href="/auth/sign-in">
          <UserCircleDashedIcon className="size-6" />
        </Link>
      </Unauthenticated>
    </div>
  )
}
