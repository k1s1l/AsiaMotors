import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Файли каталогу читаються під час виконання; підключаємо їх до серверного бандла.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
};

export default nextConfig;
