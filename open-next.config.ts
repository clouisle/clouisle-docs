import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// 文档站全部页面为 SSG 静态渲染，使用默认（dummy）增量缓存与队列即可。
export default defineCloudflareConfig();
