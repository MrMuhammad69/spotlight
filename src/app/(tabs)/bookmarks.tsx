import Loader from '@/components/Loader';
import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/feed.styles';
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { View, Text, ScrollView, Image } from 'react-native'
 
export default function bookmarks() {
  const bookMarkedPosts = useQuery(api.bookmarks.getBookMarkedPosts);
  if(bookMarkedPosts === undefined ) return <Loader />
  if(bookMarkedPosts.length === 0) return <NoBookMarksFOund />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Bookmarks
        </Text>
      </View>
      {/* Posts */}
      <ScrollView contentContainerStyle={{
        padding: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        {bookMarkedPosts.map((post)=> {
          if(!post) return null;
          return (
            <View key={post._id} style={{width: '33.33%', padding: 1 }}>
              <Image source={{uri: post.imageUrl}} style={{width: '100%', aspectRatio: 1}} />
            </View>
          )
        })}
      </ScrollView>
      
    </View>
  )
}

const NoBookMarksFOund=()=> {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background
    }}>
      <Text style ={{
        color: COLORS.primary,
        fontSize: 22
      }}>
        No bookmarked posts yet
      </Text>

    </View>
  )
}