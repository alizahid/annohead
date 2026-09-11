import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client'],
  transpilePackages: ['@anno/db'],
}

export default nextConfig
