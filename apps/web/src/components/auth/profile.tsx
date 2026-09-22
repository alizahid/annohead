import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from '@convex-dev/auth/react'
import { UserCircleDashedIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from 'cn'

import { Spinner } from '@/components/common/spinner'
import { NavLink } from '@/intl/nav'
import { getIcon } from '@/lib/icons'

import { Icon } from '../common/icon'

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
        <NavLink className="outline-none" href="/auth/profile">
          <Icon className="size-6" icon={getIcon('ui.profile')} />
        </NavLink>
      </Authenticated>

      <Unauthenticated>
        <NavLink className="outline-none" href="/auth/sign-in">
          <UserCircleDashedIcon className="size-6" />
        </NavLink>
      </Unauthenticated>
    </div>
  )
}
