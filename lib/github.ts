import { App, Octokit } from 'octokit';
import {
  actionResponse,
  pageFeedback,
  type ActionResponse,
  type PageFeedback,
} from '@/components/feedback/schema';

const owner = 'clouisle';
const repo = 'clouisle-docs';
const feedbackCategory = 'Docs Feedback';

let octokit: Octokit | undefined;
let destination:
  | {
      id: string;
      discussionCategories: {
        nodes: { id: string; name: string }[];
      };
    }
  | undefined;

async function getOctokit() {
  if (octokit) return octokit;

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!appId || !privateKey) {
    throw new Error('GitHub feedback is not configured');
  }

  const app = new App({ appId, privateKey });
  const { data } = await app.octokit.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo,
    headers: { 'X-GitHub-Api-Version': '2022-11-28' },
  });

  octokit = await app.getInstallationOctokit(data.id);
  return octokit;
}

async function getDestination() {
  if (destination) return destination;

  const client = await getOctokit();
  destination = await client.graphql<NonNullable<typeof destination>>(
    `query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        discussionCategories(first: 25) {
          nodes { id name }
        }
      }
    }`,
    { owner, repo },
  );
  return destination;
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
  const client = await getOctokit();
  const repository = await getDestination();
  const category = repository.discussionCategories.nodes.find(
    (item) => item.name === feedbackCategory,
  );

  if (!category) {
    throw new Error(`Create a "${feedbackCategory}" category in GitHub Discussions first`);
  }

  const title = `Feedback for ${path}`;
  const existing = await client.graphql<{
    search: { nodes: { id: string; title: string; url: string }[] };
  }>(
    `query($query: String!) {
      search(type: DISCUSSION, query: $query, first: 10) {
        nodes { ... on Discussion { id title url } }
      }
    }`,
    { query: `"${title}" in:title repo:${owner}/${repo} author:@me` },
  );
  const discussion = existing.search.nodes.find((item) => item.title === title);

  if (discussion) {
    const result = await client.graphql<{
      addDiscussionComment: { comment: { url: string } };
    }>(
      `mutation($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
          comment { url }
        }
      }`,
      { discussionId: discussion.id, body },
    );
    return { githubUrl: result.addDiscussionComment.comment.url };
  }

  const result = await client.graphql<{
    createDiscussion: { discussion: { url: string } };
  }>(
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
    { repositoryId: repository.id, categoryId: category.id, title, body },
  );
  return { githubUrl: result.createDiscussion.discussion.url };
}
