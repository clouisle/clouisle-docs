import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['@takumi-rs/core'],
  reactStrictMode: true,
  images: {
    // 文档图片为仓库内静态 SVG，无外部内容；配合 CSP sandbox 隔离脚本执行
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withMDX(config);
