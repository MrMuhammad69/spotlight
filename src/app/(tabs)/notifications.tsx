import Loader from '@/components/Loader'
import NotificationItem from '@/components/NotificationItem'
import { COLORS } from '@/constants/theme'
import { styles } from '@/styles/notifications.styles'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { View, Text, FlatList } from 'react-native'
 
const Notifications = () => {
  const notifications = useQuery(api.notifications.getNotifications)
  if(notifications === undefined) return <Loader />;
  if(notifications.length === 0) return <NoNotificationsFound />
  return (
    <View style={styles.container} >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifications
        </Text>
      </View>
      <FlatList data={notifications} renderItem={({item})=> {
        return (
          <NotificationItem notification={item} />
        )
      }} keyExtractor={(item)=> item._id} showsVerticalScrollIndicator={false} style={styles.listContainer} />
    </View>
  )
}

export default Notifications


const NoNotificationsFound=()=> {
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
        No Notifications yet
      </Text>

    </View>
  )
}