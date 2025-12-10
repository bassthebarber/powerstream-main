import React from 'react';
import styles from './PowerFeedCard.module.css';

const PostCard = ({ post }) => {
  if (!post) return null;

  return (
    <div className={styles.card}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      {post.image && (
        <img src={post.image} alt="Post" className={styles.image} />
      )}
    </div>
  );
};

export default PostCard;


