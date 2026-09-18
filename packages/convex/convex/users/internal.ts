import { v } from 'convex/values'

import { internalMutation } from '../_generated/server'

export const create = internalMutation({
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
