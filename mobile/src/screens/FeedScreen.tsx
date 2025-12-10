/**
 * Feed Screen (PowerFeed)
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../store';
import { fetchFeed, refreshFeed, likePost, unlikePost, fetchStories } from '../store/slices/feedSlice';
import type { Post, Story } from '../api';

// Story item component
const StoryItem: React.FC<{ story: Story }> = ({ story }) => (
  <TouchableOpacity style={styles.storyItem}>
    <View style={styles.storyAvatar}>
      {story.user.avatarUrl ? (
        <Image source={{ uri: story.user.avatarUrl }} style={styles.storyAvatarImage} />
      ) : (
        <Text style={styles.storyAvatarText}>{story.user.name[0]}</Text>
      )}
    </View>
    <Text style={styles.storyName} numberOfLines={1}>
      {story.user.name.split(' ')[0]}
    </Text>
  </TouchableOpacity>
);

// Post item component
const PostItem: React.FC<{
  post: Post;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
}> = ({ post, onLike, onUnlike }) => {
  const handleLikePress = () => {
    if (post.isLiked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          {post.user.avatarUrl ? (
            <Image source={{ uri: post.user.avatarUrl }} style={styles.postAvatarImage} />
          ) : (
            <Text style={styles.postAvatarText}>{post.user.name[0]}</Text>
          )}
        </View>
        <View style={styles.postHeaderText}>
          <Text style={styles.postAuthor}>{post.user.name}</Text>
          <Text style={styles.postTime}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Image source={{ uri: post.mediaUrls[0] }} style={styles.postMedia} />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={handleLikePress}>
          <Text style={[styles.postActionIcon, post.isLiked && styles.postActionActive]}>
            {post.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.postActionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction}>
          <Text style={styles.postActionIcon}>💬</Text>
          <Text style={styles.postActionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction}>
          <Text style={styles.postActionIcon}>🔗</Text>
          <Text style={styles.postActionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, stories, isLoading, isRefreshing, hasMore, page } = useSelector(
    (state: RootState) => state.feed
  );

  useEffect(() => {
    dispatch(fetchFeed(1));
    dispatch(fetchStories());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshFeed());
    dispatch(fetchStories());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      dispatch(fetchFeed(page + 1));
    }
  }, [dispatch, isLoading, hasMore, page]);

  const handleLike = useCallback(
    (postId: string) => {
      dispatch(likePost(postId));
    },
    [dispatch]
  );

  const handleUnlike = useCallback(
    (postId: string) => {
      dispatch(unlikePost(postId));
    },
    [dispatch]
  );

  const renderStories = () => (
    <FlatList
      horizontal
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <StoryItem story={item} />}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.storiesContainer}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Stories */}
      {stories.length > 0 && (
        <View style={styles.storiesSection}>{renderStories()}</View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color="#ffb84d" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ PowerFeed</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem post={item} onLike={handleLike} onUnlike={handleUnlike} />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#ffb84d"
          />
        }
        contentContainerStyle={styles.feedContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffb84d',
  },
  feedContent: {
    paddingBottom: 20,
  },
  // Stories
  storiesSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  storiesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#ffb84d',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  storyAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  storyName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    maxWidth: 64,
    textAlign: 'center',
  },
  // Posts
  postCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  postAvatarImage: {
    width: '100%',
    height: '100%',
  },
  postAvatarText: {
    color: '#ffb84d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postHeaderText: {
    marginLeft: 12,
  },
  postAuthor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  postContent: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    gap: 24,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionIcon: {
    fontSize: 18,
  },
  postActionActive: {
    color: '#ff6b6b',
  },
  postActionText: {
    color: '#888',
    fontSize: 14,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
});

export default FeedScreen;



