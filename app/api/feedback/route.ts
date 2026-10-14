import { pageFeedback } from '@/components/feedback/schema';
import { submitPageFeedback } from '@/lib/github';

// 反馈提交是本站唯一的动态接口：保持 force-dynamic 独立运行，
// 文档页不再内嵌 server action，从而可以锁死为纯静态。
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = pageFeedback.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid feedback' }, { status: 400 });
  }

  try {
    return Response.json(await submitPageFeedback(parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    return Response.json({ error: message }, { status: 500 });
  }
}
