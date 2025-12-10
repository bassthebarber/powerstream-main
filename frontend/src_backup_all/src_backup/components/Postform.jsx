// frontend/src/components/PostForm.jsx

import React, { useState } from 'react';

const PostForm = ({ onPost }) => {
  const [text, setText] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (text) {
      onPost(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind?"
        style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '6px' }}
      />
      <button type="submit" style={{ backgroundColor: '#FFD700', padding: '10px', marginTop: '10px' }}>
        Post
      </button>
    </form>
  );
};

export default PostForm;


