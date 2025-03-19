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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'),
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'),
  },
  // Vercel 배포 시 에셋 경로 설정
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // 후행 슬래시 처리
  trailingSlash: false,
  // React의 strick mode를 false로 설정하여 일부 호환성 문제 방지
  reactStrictMode: false,
  experimental: {
    // 소스맵 최적화
    optimizePackageImports: ['react', 'react-dom', 'next', '@radix-ui/react-*']
  }
};

module.exports = nextConfig; 