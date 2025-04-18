import { View, Text, Modal, KeyboardAvoidingView, Platform, TouchableOpacity, FlatList, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { styles } from '@/styles/feed.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import Loader from './Loader';
import CommentItem from './CommentItem';
import { Colors } from 'react-native/Libraries/NewAppScreen';
type Props = {
    postId: Id<'posts'>;
    visible: boolean;
    onClose: ()=> void;
    onCommentAdded: ()=> void;
}
export default function CommentsModal({onClose,onCommentAdded,postId,visible}: Props) {
    const [newComment,setNewComment] = useState('')
    const comments = useQuery(api.comments.getComments, {postId: postId})
    const addComment = useMutation(api.comments.addComment)
    const handleComment = async() => {
        if(!newComment.trim()) return;
       try {
        await addComment({postId: postId, content: newComment})
        setNewComment('');
        onCommentAdded()
       } catch (error) {
        console.log('An error occured while posting the comment', error)
       } 
    }
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType='slide' transparent={true}>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding': 'height'} style={styles.modalContainer} >
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name='close' size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                    Comments
                </Text>
                <View style={{width: 24}} /> 
            </View>
            {comments === undefined ? (<Loader />): (
                <FlatList data={comments} renderItem={({item})=> <CommentItem {...item} />} keyExtractor={(item)=> item._id} contentContainerStyle={styles.commentsList} />
            )} 
            <View style={styles.commentInput}>
                <TextInput style={styles.input} placeholder='Add a comment' placeholderTextColor={COLORS.grey} value={newComment} multiline onChangeText={setNewComment} />

                <TouchableOpacity onPress={handleComment} disabled={!newComment.trim()}>
                    <Text style={[styles.postButton, !newComment.trim() && styles.postButtonDisabled]}>
                        Post
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </Modal>
  )
}