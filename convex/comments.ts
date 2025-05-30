import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";



export const addComment = mutation({
    args: {
        content: v.string(),
        postId: v.id('posts')
    }, 
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const post = await ctx.db.get(args.postId);
        if(!post) throw new Error('No post found')
        const commentId = await ctx.db.insert('comments', {
        user_id: currentUser?._id,
    postId: args.postId,
    content: args.content})
    await ctx.db.patch(args.postId, {comments: post.comments + 1})
    if(post.userId !== currentUser._id) {
        await ctx.db.insert('notifications', {
            receiverId: post.userId,
            senderId: currentUser._id,
            type: 'comment',
            postId: args.postId,
            commentId
        })
    }
    }
})


export const getComments = query({
    args: {postId: v.id('posts')},
    handler: async (ctx, args) => {
        const comments = await ctx.db.query('comments').withIndex('by_post', q=> q.eq('postId', args.postId)).collect()
        const commentsWithInfo = Promise.all(
            comments.map(async (comment)=> {
                const user = await ctx.db.get(comment.user_id);
                return {
                    ...comment,
                    user: {
                        fullName: user!.fullName,
                        Image: user!.image
                    }
                }
            })
        )
        return commentsWithInfo;
    }
})