import {
  actionResponse,
  pageFeedback,
  type ActionResponse,
  type PageFeedback,
} from '@/components/feedback/schema';

const owner = 'clouisle';
const repo = 'clouisle-docs';
const feedbackCategory = 'Docs Feedback';
const api = 'https://api.github.com';

let cachedToken: { token: string; expiresAt: number } | undefined;

function b64url(input: string): string {
  return btoa(input)
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** GitHub App 认证 JWT（RS256），有效期 5 分钟，使用 WebCrypto 签名，零外部依赖。 */
async function signAppJwt(appId: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({ iat: now, exp: now + 60 * 5, iss: Number(appId) }),
  );
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput)),
  );
  const signatureB64 = b64url(String.fromCharCode(...signature));
  return `${signingInput}.${signatureB64}`;
}

async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<Response> {
  return fetch(`${api}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'clouisle-docs',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

/** 获取 GitHub App 安装访问令牌（缓存在实例内存，接近过期时刷新）。 */
async function getInstallationToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!appId || !privateKey) {
    throw new Error('GitHub feedback is not configured');
  }
  const jwt = await signAppJwt(appId, privateKey);

  const installationRes = await apiFetch(`/repos/${owner}/${repo}/installation`, {}, jwt);
  if (!installationRes.ok) {
    throw new Error(`Failed to resolve GitHub App installation: ${installationRes.status}`);
  }
  const { id: installationId } = (await installationRes.json()) as { id: number };

  const tokenRes = await apiFetch(
    `/app/installations/${installationId}/access_tokens`,
    { method: 'POST' },
    jwt,
  );
  if (!tokenRes.ok) {
    throw new Error(`Failed to create GitHub App access token: ${tokenRes.status}`);
  }
  const data = (await tokenRes.json()) as { token: string; expires_at: string };
  cachedToken = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };
  return data.token;
}

async function graphql(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${api}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'clouisle-docs',
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json()) as {
    data?: Record<string, unknown>;
    errors?: { message: string }[];
  };
  if (!res.ok || body.errors) {
    const detail = body.errors?.map((e) => e.message).join('; ') ?? `HTTP ${res.status}`;
    throw new Error(`GitHub API error: ${detail}`);
  }
  return body.data ?? {};
}

function pagePath(feedback: PageFeedback) {
  const url = new URL(feedback.url);
  const configuredOrigin = process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredOrigin && url.origin !== new URL(configuredOrigin).origin) {
    throw new Error('Invalid feedback URL');
  }

  const path = url.pathname.replace(/\/{2,}/g, '/');
  if (!path.startsWith('/') || path.length > 300) throw new Error('Invalid feedback path');
  return path;
}

function feedbackBody(feedback: PageFeedback) {
  const message = feedback.message.trim();
  if (!message || message.length > 4000) throw new Error('Feedback message is invalid');
  const opinion = feedback.opinion === 'good' ? 'good' : 'bad';
  return `[${opinion}] ${message}\n\n> Forwarded from the Clouisle docs feedback form.`;
}

export async function onPageFeedbackAction(feedback: PageFeedback): Promise<ActionResponse> {
  'use server';
  const parsed = pageFeedback.parse(feedback);
  return createDiscussion(pagePath(parsed), feedbackBody(parsed));
}

async function createDiscussion(path: string, body: string): Promise<ActionResponse> {
  const token = await getInstallationToken();

  const repository = (await graphql(
    `query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        discussionCategories(first: 25) {
          nodes { id name }
        }
      }
    }`,
    { owner, repo },
    token,
  )) as {
    repository: {
      id: string;
      discussionCategories: { nodes: { id: string; name: string }[] };
    };
  };
  const category = repository.repository.discussionCategories.nodes.find(
    (item) => item.name === feedbackCategory,
  );
  if (!category) {
    throw new Error(`Create a "${feedbackCategory}" category in GitHub Discussions first`);
  }

  const title = `Feedback for ${path}`;
  const search = (await graphql(
    `query($query: String!) {
      search(type: DISCUSSION, query: $query, first: 10) {
        nodes { ... on Discussion { id title url } }
      }
    }`,
    { query: `"${title}" in:title repo:${owner}/${repo} author:@me` },
    token,
  )) as {
    search: { nodes: { id: string; title: string; url: string }[] };
  };
  const discussion = search.search.nodes.find((item) => item.title === title);

  if (discussion) {
    const result = (await graphql(
      `mutation($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
          comment { url }
        }
      }`,
      { discussionId: discussion.id, body },
      token,
    )) as { addDiscussionComment: { comment: { url: string } } };
    return { githubUrl: result.addDiscussionComment.comment.url };
  }

  const result = (await graphql(
    `mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: {
        repositoryId: $repositoryId,
        categoryId: $categoryId,
        title: $title,
        body: $body
      }) {
        discussion { url }
      }
    }`,
    {
      repositoryId: repository.repository.id,
      categoryId: category.id,
      title,
      body,
    },
    token,
  )) as { createDiscussion: { discussion: { url: string } } };
  return { githubUrl: result.createDiscussion.discussion.url };
}
