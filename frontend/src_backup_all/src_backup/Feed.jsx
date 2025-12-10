// src/pages/Feed.jsx
import React from 'react';
import PostList from '../components/PostList';
import FeedComposer from '../components/FeedComposer';
import StoryBarPro from '../components/StoryBarPro';

export default function Feed() {
  return (
    <div>
      <StoryBarPro />
      <FeedComposer />
      <PostList />
    </div>
  );
}


