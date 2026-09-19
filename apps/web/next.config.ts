import { resolve } from 'node:path'

import { type NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/intl/request.ts')

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  outputFileTracingIncludes: {
    '/*': ['../../packages/db/anno.sqlite'],
  },
  outputFileTracingRoot: resolve(import.meta.dirname, '../..'),
  serverExternalPackages: ['@libsql/client'],
  transpilePackages: ['@anno/db'],
}

export default withNextIntl(config)
