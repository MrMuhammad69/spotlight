import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { styles } from '@/styles/notifications.styles'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import {formatDistanceToNow} from 'date-fns'
export default function NotificationItem({notification}:any) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${notification.sender._id}` } asChild>
        <TouchableOpacity style={styles.avatarContainer}>
            <Image source={{uri: notification.sender.image}} style={styles.avatar} />
            <View style={styles.iconBadge}>
                {notification.type === 'like' ? (
                    <Ionicons name='heart' size={14} color={COLORS.primary} />
                ): notification.type=== 'follow' ? (
                    <Ionicons name='person-add' size={14} color={'#885cF6'} />
                ):(
                    <Ionicons name='chatbubble' size={14} color={'#3882F6'} />
                ) }
            </View>
        </TouchableOpacity>
        </Link>
        <View style={styles.notificationInfo}>
            <Link href={`/user/${notification.sender._id}`} asChild>
            <TouchableOpacity>
                <Text style={styles.username}>{notification.sender.username}</Text>
            </TouchableOpacity>
            </Link>
            <Text style={styles.action}>
                {notification.type === 'follow'? 'started following you': notification.type === 'like'? 'liked your post': `commented: "${notification.comment}"`}
            </Text>
            <Text style={styles.timeAgo}>
                {formatDistanceToNow(notification._creationTime, {addSuffix: true})}
            </Text>
        </View>
      </View>
      {notification.post && (
        <Image source={{uri: notification.post.imageUrl}} style={styles.postImage} />
      )}
    </View>
  )
}