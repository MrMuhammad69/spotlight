import { View, Text, Image } from 'react-native'
import React from 'react'
import { styles } from '@/styles/feed.styles';
import {formatDistanceToNow} from 'date-fns'
type Props = {
    content: string;
    _creationTime: number;
    user: {
        fullName: string;
        Image:string;
    };
}
const CommentItem = ({_creationTime,content,user}: Props) => {
  return (
    <View style={styles.commentContainer}>
        <Image source={{uri: user.Image}} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
            <Text style={styles.commentUsername}>{user.fullName}</Text>
            <Text style={styles.commentText}>{content}</Text>
            <Text style={styles.commentTime}>{formatDistanceToNow(_creationTime, {addSuffix:true})}</Text>
        </View>
    </View>
  )
}

export default CommentItem