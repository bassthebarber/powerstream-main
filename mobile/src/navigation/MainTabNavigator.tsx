/**
 * Main Tab Navigator
 * Bottom tabs for authenticated users
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';

import FeedScreen from '../screens/FeedScreen';
import ChatScreen from '../screens/ChatScreen';
import TVScreen from '../screens/TVScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Tab icons (using simple View placeholders - replace with proper icons)
const TabIcon: React.FC<{ focused: boolean; name: string }> = ({ focused, name }) => (
  <View style={[styles.icon, focused && styles.iconFocused]}>
    {/* Replace with proper icons (e.g., react-native-vector-icons) */}
  </View>
);

export type MainTabParamList = {
  Feed: undefined;
  Chat: undefined;
  TV: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ffb84d',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={route.name} />,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: 'Feed' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen
        name="TV"
        component={TVScreen}
        options={{ tabBarLabel: 'TV' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0a0a',
    borderTopColor: '#222',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  iconFocused: {
    backgroundColor: '#ffb84d',
  },
});

export default MainTabNavigator;



