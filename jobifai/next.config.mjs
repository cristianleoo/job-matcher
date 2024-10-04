/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations
  async redirects() {
    return [
      {
        source: '/user',
        destination: '/profile',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
