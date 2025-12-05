# PowerFeed Wiring (Feed, Posts, and Components)

## Overview

PowerFeed is the main social feed inside PowerStream. It supports:

- Creating simple text + optional image posts.
- Listing posts in a Facebook‑style 3‑column layout (left shortcuts, center feed, right suggestions).

This document explains how the **frontend pages/components** talk to the **backend feed API**.

---

## 1. Backend: Feed API

- **Routes file**: `backend/routes/feedRoutes.js`
- **Controller**: `backend/controllers/feedController.js`
- **Model**: `backend/models/FeedPost.js` (assumed)
- **Base path**: `/api/feed`

### 1.1 Routes

| Route   | Method | Description                    |
|---------|--------|--------------------------------|
| `/`     | GET    | List feed posts (newest first) |
| `/`     | POST   | Create a new post              |

### 1.2 Controller Logic

**getFeed**

```js
// GET /api/feed
export async function getFeed(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const posts = await FeedPost.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    ok: true,
    posts,
    page,
    hasMore: posts.length === limit,
  });
}
```

**createPost**

```js
// POST /api/feed
export async function createPost(req, res) {
  const { authorName, content, image } = req.body;
  if (!content && !image) {
    return res.status(400).json({ ok: false, message: "content or image is required" });
  }

  const post = await FeedPost.create({
    authorName: authorName || "Guest",
    content: content || "",
    image: image || "",
  });

  res.status(201).json({ ok: true, post });
}
```

---

## 2. Frontend API Client

- **File**: `frontend/src/lib/api.js`

### 2.1 Helper Functions

```js
// List posts
export async function fetchFeed() {
  const res = await api.get("/feed");
  return res.data;
}

// Create a new post
export async function createFeedPost(payload) {
  const res = await api.post("/feed", payload);
  return res.data;
}
```

Both helpers use the shared Axios instance `api` which:

- Uses `VITE_API_URL` or `http://localhost:5001/api` as `baseURL`.
- Automatically attaches `Authorization: Bearer <token>` when the user is logged in.

---

## 3. Frontend Pages & Components

### 3.1 Main Feed Page

- **File**: `frontend/src/pages/Feed.jsx`
- **Route**: `/powerfeed` (and alias `/feed`)

Responsibilities:

- Fetch posts from the backend on mount using `fetchFeed()`.
- Render 3‑column layout:
  - **Left**: mini profile, shortcuts.
  - **Center**: `StoryBar` + `PostForm` + posts list.
  - **Right**: `PeopleYouMayKnow`.

Key logic:

```js
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchPosts();
}, []);

const fetchPosts = async () => {
  setLoading(true);
  const res = await fetchFeed();
  if (Array.isArray(res)) setPosts(res);
  else if (Array.isArray(res.posts)) setPosts(res.posts);
  else if (Array.isArray(res.items)) setPosts(res.items);
  setLoading(false);
};

const handleCreatePost = async ({ content, image }) => {
  if (!content.trim() && !image.trim()) return;
  const payload = {
    authorName: user?.name || user?.email || "Guest",
    content,
    image,
  };
  const result = await createFeedPost(payload);
  if (result?.ok) {
    await fetchPosts(); // Refresh feed after successful post
  }
};
```

Rendering posts:

```jsx
<section className="pf-posts-section">
  {loading ? (
    <div className="pf-loading">Loading feed…</div>
  ) : posts.length === 0 ? (
    <div className="pf-empty">No posts yet. Be the first to post!</div>
  ) : (
    <div className="pf-posts">
      {posts.map((post) => (
        <PostCard
          key={post._id || post.id}
          post={post}
          userId={userId}
          onReact={() => {}}
          onComment={() => {}}
        />
      ))}
    </div>
  )}
  </section>
```

---

### 3.2 PostForm (Create Post)

- **File**: `frontend/src/components/PostForm.jsx`

Responsibilities:

- Let the user type post text and optional image URL.
- Call `onSubmit({ content, image })` passed from `Feed.jsx`.
- Clear the form on success.

Example behavior:

```jsx
export default function PostForm({ onSubmit, userInitials }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image.trim()) return;
    onSubmit({ content, image });
    setContent("");
    setImage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* avatar + textarea + optional image URL input */}
    </form>
  );
}
```

---

### 3.3 PostCard (Render Single Post)

- **File**: `frontend/src/components/PostCard.jsx`

Responsibilities:

- Display:
  - `authorName`
  - `createdAt` (if present)
  - `content` text
  - Optional `image` (as `img` tag)
- Show placeholder “Like” and “Comment” buttons (hooks ready for future endpoints).

Example structure:

```jsx
export default function PostCard({ post }) {
  return (
    <article className="pf-post-card">
      <header>
        <div className="pf-post-author">{post.authorName || "Guest"}</div>
        {post.createdAt && (
          <div className="pf-post-time">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        )}
      </header>
      <div className="pf-post-body">
        {post.content && <p>{post.content}</p>}
        {post.image && <img src={post.image} alt="" />}
      </div>
      {/* Like / Comment bar (UI only for now) */}
    </article>
  );
}
```

---

### 3.4 Auxiliary Components

- **StoryBar**
  - **File**: `frontend/src/components/StoryBar.jsx`
  - Static “stories” row at top of feed center column.
- **PeopleYouMayKnow**
  - **File**: `frontend/src/components/PeopleYouMayKnow.jsx`
  - Static suggestions list in right column.

These components are **UI‑only** and do not call APIs; they exist to match the social feed UX you requested.

---

## 4. End‑to‑End Flow Summary

### Create Post

1. User types content (and optional image URL) in `PostForm`.
2. `PostForm` calls `onSubmit({ content, image })`.
3. `Feed.jsx` calls `createFeedPost(payload)` → `POST /api/feed`.
4. Backend `feedController.createPost` writes `FeedPost` entry and returns it.
5. On success, `Feed.jsx` re‑calls `fetchFeed()` and updates its `posts` state.
6. `PostCard` renders the new post in the center column.

### List Posts

1. `Feed.jsx` runs `fetchPosts()` on mount.
2. `fetchFeed()` calls `GET /api/feed`.
3. Backend returns `ok: true, posts: [...]`.
4. `posts` state is populated and displayed via `PostCard` components.

All requests go through the shared Axios `api` client, which:

- Uses `VITE_API_URL` / `http://localhost:5001/api` as base.
- Attaches JWT token from `localStorage` when available.

---

**POWERFEED WIRING: CREATE + LIST + COMPONENTS DOCUMENTED** ✅



