/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental.appDir은 Next.js 13+에서 기본값이므로 제거
  typescript: {
    // 빌드 시 타입 체크를 엄격하게 수행
    ignoreBuildErrors: false,
  },
  eslint: {
    // 빌드 시 ESLint 검사를 수행
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
