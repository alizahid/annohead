import { type NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/intl/request.ts')

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  serverExternalPackages: ['@libsql/client'],
  transpilePackages: ['@anno/db'],
}

export default withNextIntl(config)
