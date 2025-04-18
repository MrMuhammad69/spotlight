import Loader from '@/components/Loader';
import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/profile.styles';
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons';
import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
 
export default function profile() {
  const {signOut, userId} = useAuth()
  const [isEditModalVisible, setisEditModalVisible] = useState(false);
  const currentUser = useQuery(api.users.getUserByClerkId, {clerkId: userId || ''});
  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullName || '',
    bio: currentUser?.bio || ''
  });
  const [isSelectedPicture, setIsSelectedPicture] = useState(null);
  const post = useQuery(api.posts.getPostsByUser, {})
  const updateProfile = useMutation(api.users.updateProfile);
  const handleSaveProfile = async ()=> { 
   try {
    await updateProfile(editedProfile)
    setisEditModalVisible(false)
   } catch (error) {
    console.error(error)
   }
  };
  if(!currentUser || post === undefined) return <Loader />

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>
            {currentUser.username}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={()=> signOut()}>
            <Ionicons name='log-out-outline' size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* Avatar stats */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: currentUser.image}} style={styles.avatar} /> 
            </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser.posts}
              </Text>
              <Text style={styles.statLabel}>
                Posts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser.followers}
              </Text>
              <Text style={styles.statLabel}>
                followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser.following}
              </Text>
              <Text style={styles.statLabel}>
                following
              </Text>
            </View>
          </View>
          </View>
          <Text style={styles.name}>
            {currentUser.fullName}
          </Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} className='bg-gray-900' onPress={()=> setisEditModalVisible(true)}>
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className='bg-gray-900' style={styles.shareButton}>
              <Ionicons name='share-outline' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        {post.length === 0 && <NoPostFound />}
        <FlatList
        data={post}
        numColumns={3}
        scrollEnabled={false}
        renderItem={({item})=> (
          <TouchableOpacity style={styles.gridItem} onPress={()=> setIsSelectedPicture(item)}>
            <Image source={{uri: item.imageUrl}} style={styles.gridImage} />
          </TouchableOpacity>
  )}
        />
      </ScrollView>
      <Modal visible={isEditModalVisible}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS == 'ios' ? 'padding': 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={()=> setisEditModalVisible(false)}>
                <Ionicons name='close' size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.input} value={editedProfile.fullname}  className='bg-gray-900' onChangeText={(text)=> setEditedProfile((prev)=> ({...prev, fullname: text}))} placeholderTextColor={COLORS.grey} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.input, styles.bioInput]}>Bio</Text>
              <TextInput style={styles.input} value={editedProfile.bio} numberOfLines={4} multiline className='bg-gray-900'  onChangeText={(text)=> setEditedProfile((prev)=> ({...prev, bio: text}))} placeholderTextColor={COLORS.grey} />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={!!isSelectedPicture} animationType='fade' transparent={true} onRequestClose={()=> setIsSelectedPicture(null)}>
        <View style={styles.modalBackdrop}>
          {isSelectedPicture && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={()=> setIsSelectedPicture(null)}>
                  <Ionicons name='close' size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Image source={{uri: isSelectedPicture.imageUrl}} style={styles.postDetailImage} />
            </View>
          )}
        </View>
      </Modal>
    </View>
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