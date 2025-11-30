// src/components/feed/PowerSave.jsx
export default function PowerSave({ postId }) {
  const handleSave = () => {
    // Call backend API to save post
    alert("Post saved to your profile.");
  };

  return (
    <button onClick={handleSave} className="save-btn">💾 Save</button>
  );
}


