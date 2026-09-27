import { type ProviderBuilders, setupCore } from '@convex-dev/auth/core/setup'
import { vSignInComplete, vSignInError } from '@convex-dev/auth/lib/types'
import { setupUsernamePassword } from '@convex-dev/auth/providers/password/setup'
import { v } from 'convex/values'

import { components, internal } from './_generated/api'
import { getSteamPersonaName, verifySteamAssertion } from './lib/steam'

const core = setupCore({
  component: components.auth,
})

export const { signOut, refreshSession, isAuthenticated } = core

export const { signUpWithPassword, signInWithPassword, changePassword } =
  setupUsernamePassword(core, {
    component: components.authPasswordProvider,
    usernameComponent: components.authUsername,
  }).attachUserCallbacks({
    createUser: internal.users.internal.createWithPassword,
  })

const steam: ProviderBuilders<{
  username: string
}> = core.bindProvider({
  createUser: internal.users.internal.createWithSteam,
  name: 'steam',
})

export const signInWithSteam = steam.authAction({
  args: {
    params: v.record(v.string(), v.string()),
  },
  async handler(ctx, args) {
    const steamId = await verifySteamAssertion(args.params)

    if (!steamId) {
      return {
        status: 'error' as const,
        userError: { error: 'INVALID_ASSERTION' as const },
      }
    }

    const profile = {
      username: await getSteamPersonaName(steamId),
    }

    const userId = await ctx.convexAuth.resolveUserId(steamId)

    const tokens = userId
      ? await ctx.convexAuth.completeSignIn({
          profile,
          providerAccountId: steamId,
        })
      : await ctx.convexAuth.completeSignUp({
          profile,
          providerAccountId: steamId,
        })

    return { status: 'complete' as const, tokens }
  },
  returns: v.union(
    vSignInComplete,
    vSignInError(v.object({ error: v.literal('INVALID_ASSERTION') })),
  ),
})
