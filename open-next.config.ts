import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// 文档站全部页面构建期 SSG 预渲染（485 条路由），用只读静态资产增量缓存：
// 预渲染产物经 `opennextjs-cloudflare populateCache` 复制进 .open-next/assets 随部署上传，
// 运行时经 ASSETS binding 直接命中缓存返回，worker 不再逐请求渲染页面。
// 注意：此缓存只读、不做 revalidate，文档内容随部署更新，符合文档站模型。
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
