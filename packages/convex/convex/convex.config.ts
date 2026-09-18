import auth from '@convex-dev/auth/core/convex.config.js'
import password from '@convex-dev/auth/providers/password/convex.config.js'
import username from '@convex-dev/auth/username/convex.config.js'
import { defineApp } from 'convex/server'
import { v } from 'convex/values'

const app = defineApp({
  env: {
    AUTH_JWKS: v.string(),
    AUTH_PRIVATE_KEY: v.string(),
  },
})

app.use(auth, {
  env: {
    AUTH_JWKS: app.env.AUTH_JWKS,
    AUTH_PRIVATE_KEY: app.env.AUTH_PRIVATE_KEY,
  },
  httpPrefix: '/auth',
})

app.use(password)
app.use(username)

export default app
