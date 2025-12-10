import React from 'react';
import PostComposer from '../components/PowerFeed/PostComposer.jsx';
import PostList from '../components/PowerFeed/PostList.jsx';

export default function Feed() {
  return (
    <div className="feed-page">
      <h1>PowerFeed</h1>
      <PostComposer />
      <PostList />
    </div>
  );
}


