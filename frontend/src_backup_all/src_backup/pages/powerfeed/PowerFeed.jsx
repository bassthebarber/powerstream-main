import { useState } from "react";

const stories = [
  { id: 1, user: "Marcus", img: "/logos/powerstream-logo.png" },
  { id: 2, user: "Brooklyn", img: "/logos/powergram-logo.png" },
  { id: 3, user: "Community", img: "/logos/powerreels-logo.png" },
  { id: 4, user: "NoLimit", img: "/logos/nolimit-easthouston-logo.png" },
];

export default function PowerFeed() {
  const [posts, setPosts] = useState([
    { id: 1, author: "Marcus", text: "🚀 PowerStream is live!", likes: 25 },
    { id: 2, author: "Brooklyn", text: "Building the future with AI 💡", likes: 14 },
    { id: 3, author: "Community", text: "Welcome to the Sovereign Network 🌍", likes: 30 },
  ]);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (newPost.trim() !== "") {
      setPosts([{ id: Date.now(), author: "You", text: newPost, likes: 0 }, ...posts]);
      setNewPost("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-6 space-y-6">
      {/* Story Bar */}
      <section className="flex gap-4 overflow-x-auto pb-2">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center w-24 cursor-pointer hover:scale-105 transition"
          >
            <div className="w-20 h-20 rounded-full border-2 border-yellow-400 overflow-hidden">
              <img src={story.img} alt={story.user} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm mt-2">{story.user}</span>
          </div>
        ))}
      </section>

      {/* Composer */}
      <section className="bg-black border border-yellow-400/40 rounded-xl p-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-black text-yellow-400 p-3 rounded-md border border-yellow-400/30 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows="3"
        />
        <button
          onClick={handlePost}
          className="mt-3 bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition"
        >
          Post
        </button>
      </section>

      {/* Posts */}
      <section className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="bg-black border border-yellow-400/40 rounded-xl p-4 shadow">
            <h3 className="font-bold">{post.author}</h3>
            <p className="mt-2">{post.text}</p>
            <div className="text-sm text-yellow-200/70 mt-2">👍 {post.likes} likes</div>
          </article>
        ))}
      </section>
    </div>
  );
}
