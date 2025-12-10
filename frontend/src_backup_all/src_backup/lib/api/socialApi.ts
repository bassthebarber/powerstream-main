// frontend/src/lib/socialApi.ts
const BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001/api').replace(/\/$/, '');

type Json = Record<string, any>;

async function req<T = Json>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface SocialPost {
  _id: string;
  userId?: string;
  username?: string;
  text?: string;
  mediaType?: string;
  mediaUrl1?: string;
  likes?: string[];
  comments?: { userId: string; content: string; createdAt?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export const SocialAPI = {
  listPosts: () => req<SocialPost[]>('/social/posts'),
  createPost: (data: Partial<SocialPost>) =>
    req<{ post: SocialPost }>('/social/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  likePost: (id: string, userId: string) =>
    req(`/social/posts/${id}/like`, { method: 'POST', body: JSON.stringify({ userId }) }),
  commentPost: (id: string, userId: string, content: string) =>
    req(`/social/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ userId, content }) }),
};

