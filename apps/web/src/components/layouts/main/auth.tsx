import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from '@convex-dev/auth/react'
import {
  CircleNotchIcon,
  UserCircleDashedIcon,
  UserCircleIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Link } from '@/intl/nav'

export function AuthCard() {
  return (
    <>
      <AuthLoading>
        <CircleNotchIcon className="size-8 animate-spin" />
      </AuthLoading>

      <Authenticated>
        <Link
          className="flex size-10 items-center justify-center rounded-full outline-none ring-accent-8 focus-visible:ring-2"
          href="/auth/profile"
        >
          <UserCircleIcon className="size-8" />
        </Link>
      </Authenticated>

      <Unauthenticated>
        <Link
          className="flex size-10 items-center justify-center rounded-full outline-none ring-accent-8 focus-visible:ring-2"
          href="/auth/sign-in"
        >
          <UserCircleDashedIcon className="size-8" />
        </Link>
      </Unauthenticated>
    </>
  )
}
