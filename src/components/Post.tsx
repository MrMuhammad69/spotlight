import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/styles/feed.styles'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import CommentsModal from './CommentsModal'
import { useUser } from '@clerk/clerk-expo'
type PostProps = {
    post: {
        _id: Id<'posts'>;
        imageUrl: string;
        caption?:string;
        likes: number;
        comments: number;
        _creationTime: number;
        isLiked: boolean;
        isBookmarked: boolean
        author: {
            _id: string;
            username: string;
            image: string
        }
    },
   
}
export default function Post({post}: PostProps) {
    const toggleLike = useMutation(api.posts.toggleLike)
    const deletePost = useMutation(api.posts.deletePost)
    const {user} = useUser()
    const currentUser   = useQuery(api.users.getUserByClerkId, {clerkId: user?.id})
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [commentsCount, setCommentsCount] = useState(post.comments)
    const [showComments, setShowComments]  = useState(false)
    const handleLike = async () => {
        try {
            const like = await toggleLike({postId: post._id})
            setIsLiked(like)
            setLikesCount((prev)=> (like ? prev +1: prev - 1))
        } catch (error) {
            console.error('Error toggling like', error)
        }
    }
    const toggleBookmart = useMutation(api.bookmarks.toggleBookMark)

    const handleBookmark = async ()=> {
        const newIsBookmarked = await toggleBookmart({postId: post._id})
        setIsBookmarked(newIsBookmarked)
    }
    const handleDelete = async()=> {
        try {
            await deletePost({postId: post._id})
        } catch (error) {
            console.error('Error deleting the post', error)
        }
    }
  return (
    <View style={styles.post}>
        {/* Post Header */}
        <View style={styles.postHeader}>
            <Link href={`/user/${post.author._id}`}>
            <TouchableOpacity style={styles.postHeaderLeft}>
                <Image source={{uri: post.author.image}} style={styles.postAvatar} />
                    <Text style={styles.postUsername}>
                        {post.author.username}
                    </Text>
            </TouchableOpacity>
            
            </Link>
            {/* if i am the owner of the post, show the delete button */}
            {/* Show a dete button: TODO: fix it later */}
            {post.author._id === currentUser?._id ? (
                <TouchableOpacity onPress={handleDelete}>
                <Ionicons name='trash-outline' size={20} color={COLORS.primary} />
            </TouchableOpacity>
            ): (
                <TouchableOpacity>
                <Ionicons name='ellipsis-horizontal' size={20} color={COLORS.primary} />
            </TouchableOpacity>
            )}
            
            
           
            
        </View>
        <Image source={{uri: post.imageUrl}} style={styles.postImage} />
        {/* Post Actions */}
        <View style={styles.postActions}>
            <View style={styles.postActionsLeft}>
                <TouchableOpacity onPress={handleLike}>
                    <Ionicons name={isLiked? 'heart' : 'heart-outline'} size={24} color={ isLiked ? COLORS.primary: COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> setShowComments(true)}>
                    <Ionicons name='chatbubble-outline' size={22} color={COLORS.white}  />
                </TouchableOpacity>

            </View>
            <TouchableOpacity onPress={handleBookmark}>
                    <Ionicons name={isBookmarked? 'bookmark': 'bookmark-outline'} size={22} color={isBookmarked ? COLORS.primary: COLORS.white} />
                </TouchableOpacity>
        </View>
        {/* POST INFO */}
        <View style={styles.postInfo}>
            <Text style={styles.likesText}>
                {likesCount > 0 ? `${likesCount.toLocaleString()} likes`:  'Be the first to like' }
            </Text>
            {post.caption && (
                <View style={styles.captionContainer}>
                    <Text style={styles.captionUsername}>
                        {post.author.username}
                    </Text>
                    <Text style={styles.captionText}>
                        {post.caption}
                    </Text>
                </View>
            )}
            <TouchableOpacity onPress={()=> setShowComments(true)}>
           {commentsCount > 0 && (
             <Text style={styles.commentText}>View all {post.comments} comments</Text>
           )}
        </TouchableOpacity>
        <Text style={styles.timeAgo} > 2 hours ago </Text>
        </View>
        <CommentsModal postId={post._id} visible={showComments} onClose={()=> setShowComments(false)} onCommentAdded={()=> setCommentsCount((prev)=> prev+ 1)} />
    </View>
  )
}