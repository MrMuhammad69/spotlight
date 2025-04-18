import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { styles } from '@/styles/feed.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { STORIES } from '@/constants/mock-data';
import Story from '@/components/story';
import { useQueries, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import Loader from '@/components/Loader';
import Post from '@/components/Post';

const FeedScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const post = useQuery(api.posts.getFeedPosts)
  if(post === undefined) {
    return <Loader />
  }
  if(post.length ===0) return <NoPostFound />
  const handleLogout = async () => {
    try {
      await signOut();
      // User is now logged out
    } catch (err) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout error:', err  );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name='log-out-outline' size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList data={post} renderItem={({item})=> <Post post={item} key={item._id} /> } showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 60}} ListHeaderComponent={<StoriesSection />} />
    </View>
    
  );

  
};

export default FeedScreen;

const StoriesSection = ()=> {
  return (
 <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
      >
        {STORIES?.map((story) => (
          <Story key={story.id} story={story} />
        ))}
      </ScrollView> 
  )
}

const NoPostFound = () =>{
  return (
  <View  style={{
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{fontSize: 20, color: COLORS.primary}}>
      No posts yet
    </Text>
  </View>
  )
}