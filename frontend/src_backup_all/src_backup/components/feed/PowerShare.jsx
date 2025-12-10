// src/components/feed/PowerShare.jsx
export default function PowerShare({ postId }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/feed/post/${postId}`;
    await navigator.clipboard.writeText(url);
    alert("Post link copied!");
  };

  return (
    <button onClick={handleShare} className="share-btn">🔗 Share</button>
  );
}


