import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from '@convex-dev/auth/react'
import {
  UserCircleDashedIcon,
  UserCircleIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Spinner } from '@/components/common/spinner'
import { Link } from '@/intl/nav'

export function AuthCard() {
  return (
    <>
      <AuthLoading>
        <div className="flex size-10 items-center justify-center">
          <Spinner className="size-8" />
        </div>
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
