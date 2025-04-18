import { View, Text, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Id } from 'convex/_generated/dataModel'
import Loader from '@/components/Loader'
import { styles } from '@/styles/profile.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useAuth } from '@clerk/clerk-expo'

export default function UserProfileScreen() {
    const {id} = useLocalSearchParams()
    const {userId} = useAuth()
    const currentUser = useQuery(api.users.getUserByClerkId, {clerkId: userId});
    if(currentUser === undefined) return <Loader />
    if(currentUser._id === id) return <Redirect href={'/(tabs)/profile'} />
    const profile = useQuery(api.users.getUserProfile, {id:id as Id<'users'> })
    const posts = useQuery(api.posts.getPostsByUser, {userId: id as Id<'users'>})
    const isFollowing = useQuery(api.users.isFollowing, {followingId: id as Id<'users'>}) 
    const toggleFollow = useMutation(api.users.toggleFollow)
    const [isSelectedPicture, setIsSelectedPicture] = useState(null);
    const handleFollow = async ()=> {
        try {
            await toggleFollow({followingId: id as Id<'users'>})
        } catch (error) {
            console.error(error)
        }
    }
    const handleBack = () => {
        router.back()
    }
    if(profile === undefined || posts === undefined || isFollowing === undefined) return <Loader />
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Ionicons name='arrow-back' size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{profile.username}</Text>
            <View style={{width: 24}} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* Avatar stats */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: profile.image}} style={styles.avatar} /> 
            </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.posts}
              </Text>
              <Text style={styles.statLabel}>
                Posts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.followers}
              </Text>
              <Text style={styles.statLabel}>
                followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.following}
              </Text>
              <Text style={styles.statLabel}>
                following
              </Text>
            </View>
          </View>
          </View>
          <Text style={styles.name}>
            {profile.fullName}
          </Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
            <TouchableOpacity style={[styles.followButton, isFollowing && styles.followButton]} className='bg-gray-900' onPress={handleFollow}>
              <Text style={[styles.followButtonText, isFollowing && styles.followButtonText]}>
                {isFollowing ? 'Following': 'Follow'}
              </Text>
            </TouchableOpacity>
        </View>
        {posts.length === 0 && <NoPostFound />}
        <FlatList
        data={posts}
        numColumns={3}
        scrollEnabled={false}
        renderItem={({item})=> (
          <TouchableOpacity style={styles.gridItem} onPress={()=> setIsSelectedPicture(item)}>
            <Image source={{uri: item.imageUrl}} style={styles.gridImage} />
          </TouchableOpacity>
  )}
        />
      </ScrollView>
    </View>
    
  )
}


const NoPostFound = () =>{
    return (
    <View  style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 30
    }}>
      <Text style={{fontSize: 20, color: COLORS.primary}}>
        No posts yet
      </Text>
    </View>
    )
  }