/**
 * Chat Screen (PowerLine)
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../store';
import { fetchConversations } from '../store/slices/chatSlice';
import type { Conversation } from '../api';

// Conversation item component
const ConversationItem: React.FC<{
  conversation: Conversation;
  currentUserId?: string;
  onPress: () => void;
}> = ({ conversation, currentUserId, onPress }) => {
  // Get the other participant(s)
  const otherParticipants = conversation.participants.filter(
    (p) => p.id !== currentUserId
  );
  const displayName =
    otherParticipants.length > 0
      ? otherParticipants.map((p) => p.name).join(', ')
      : 'Unknown';
  const displayAvatar = otherParticipants[0]?.avatarUrl;

  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
      <View style={styles.conversationAvatar}>
        {displayAvatar ? (
          <Image source={{ uri: displayAvatar }} style={styles.conversationAvatarImage} />
        ) : (
          <Text style={styles.conversationAvatarText}>
            {displayName[0]?.toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {displayName}
          </Text>
          {conversation.lastMessage && (
            <Text style={styles.conversationTime}>
              {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {conversation.lastMessage && (
          <Text style={styles.conversationLastMessage} numberOfLines={1}>
            {conversation.lastMessage.content}
          </Text>
        )}
      </View>

      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ChatScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationPress = (conversation: Conversation) => {
    // TODO: Navigate to conversation detail
    console.log('Open conversation:', conversation.id);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateText}>
        Start a conversation with someone!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ PowerLine</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Text style={styles.newChatButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            currentUserId={user?.id}
            onPress={() => handleConversationPress(item)}
          />
        )}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#ffb84d"
          />
        }
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContent : undefined
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffb84d',
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffb84d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#0a0a0a',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  // Conversation item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  conversationAvatarImage: {
    width: '100%',
    height: '100%',
  },
  conversationAvatarText: {
    color: '#ffb84d',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    color: '#666',
    fontSize: 12,
  },
  conversationLastMessage: {
    color: '#888',
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#ffb84d',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Empty state
  emptyContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChatScreen;



