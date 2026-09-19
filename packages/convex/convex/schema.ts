import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  comments: defineTable({
    body: v.string(),
    guid: v.number(),
    userId: v.id('users'),
  })
    .index('by_guid', ['guid'])
    .index('by_user', ['userId']),
  users: defineTable({
    username: v.string(),
  }),
})
