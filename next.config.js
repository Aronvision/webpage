/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    // 환경 변수가 없을 경우 기본값 제공
    NEXTAUTH_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  experimental: {
    // React의 strick mode를 false로 설정하여 일부 호환성 문제 방지
    reactStrictMode: false,
    // 소스맵 최적화
    optimizePackageImports: ['react', 'react-dom', 'next', '@radix-ui/react-*']
  }
};

module.exports = nextConfig; 