import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from '@convex-dev/auth/react'

import { SignIn } from '@/components/auth/sign-in'
import { Loading } from '@/components/common/loading'
import { Redirect } from '@/components/common/redirect'

export default function Page() {
  return (
    <>
      <AuthLoading>
        <Loading />
      </AuthLoading>

      <Authenticated>
        <Redirect href="/" />
      </Authenticated>

      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
    </>
  )
}
