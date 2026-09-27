import { v } from 'convex/values'
import { customAlphabet } from 'nanoid'

import { components } from '../_generated/api'
import { internalMutation, type MutationCtx } from '../_generated/server'

export const createWithPassword = internalMutation({
  args: {
    provider: v.object({
      accountId: v.string(),
      name: v.literal('password'),
      profile: v.object({
        username: v.string(),
      }),
    }),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('users', {
      username: args.provider.profile.username,
    })
  },
})

export const createWithSteam = internalMutation({
  args: {
    provider: v.object({
      accountId: v.string(),
      name: v.literal('steam'),
      profile: v.object({
        username: v.string(),
      }),
    }),
  },
  async handler(ctx, args) {
    const username = await findFreeUsername(ctx, args.provider.profile.username)

    const userId = await ctx.db.insert('users', {
      username,
    })

    // registered with the username component so password sign ups see it too
    const result = await ctx.runMutation(
      components.authUsername.public.setUsername,
      {
        userId,
        username,
      },
    )

    if (!result.success) {
      throw new Error(`Could not set username: ${result.userError.error}`)
    }

    return userId
  },
})

// Steam names aren't unique, so a taken one gets a random suffix: name_k3x9
const suffix = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 4)

async function findFreeUsername(ctx: MutationCtx, name: string) {
  let username = name

  while (
    // biome-ignore lint/performance/noAwaitInLoops: each check depends on the last
    await ctx.runQuery(components.authUsername.public.getUserIdByUsername, {
      username,
    })
  ) {
    username = `${name}_${suffix()}`
  }

  return username
}
