import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx)=> {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity) throw new Error('unauthorized');
    return await ctx.storage.generateUploadUrl()
})
export const createPost = mutation({
    
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"),
    }, 
    handler: async ( ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)
        const imageUrl = await ctx.storage.getUrl(args.storageId);
    if(!imageUrl) throw new Error('Image not found')
        // create post logic
    const postid = await ctx.db.insert('posts', {
        userId: currentUser._id,
        imageUrl: imageUrl,
        storageId: args.storageId,
        caption: args.caption,
        likes: 0,
        comments: 0
    })

    await ctx.db.patch(currentUser._id,{
        posts: currentUser.posts + 1
    })
    return postid
    }
})


export const getFeedPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);
        // get all posts
        const posts  = await ctx.db.query('posts').order('desc').collect()
        if(posts.length === 0) return [];
        // enhance posts with user data and interaction status:
        const postsWithSomeInfo = await Promise.all(
            posts.map(async(post) => {
                const postAuthor = await ctx.db.get(post.userId)

                const like = await ctx.db.query('likes').withIndex('by_user_and_post', (q)=> q.eq('userId', currentUser._id).eq('postId', post._id)).first()
                const bookmark = await ctx.db.query('bookmarks').withIndex('by_user_and_post', (q)=> q.eq('userId', currentUser._id).eq('postId', post._id)).first()
                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image
                    },
                    isLiked: !!like,
                    isBookmarked: !!bookmark
                }
            })
        )
        return postsWithSomeInfo;
    }
})

export const toggleLike = mutation({
    args: {postId: v.id('posts')},
    handler:async (ctx, args) => {
        const currnetUser = await getAuthenticatedUser(ctx)
        const existing = await ctx.db.query('likes').withIndex('by_user_and_post', (q) => q.eq('userId', currnetUser._id).eq('postId', args.postId)).first()
        const post = await ctx.db.get(args.postId);
        if(!post) throw new Error('Post not found')
        if(existing) {
            await ctx.db.delete(existing._id)
            await ctx.db.patch(args.postId, {likes: post.likes - 1})
            return false; // unliked
        } else {
            // add like
            await ctx.db.insert('likes', {
                userId: currnetUser._id,
                postId: args.postId
            })
            await ctx.db.patch(args.postId, { likes: post.likes + 1});
            if(currnetUser._id !== post.userId) {
                await ctx.db.insert('notifications', {
                    receiverId: post.userId,
                    senderId: currnetUser._id,
                    type: 'like',
                    postId: args.postId
                })
            }
            return true // liked

        }
    }
})


export const deletePost = mutation({
    args: {
        postId: v.id('posts')
    },
    handler: async (ctx, args)=> {
        const currentUser = await getAuthenticatedUser(ctx);
        const post = await ctx.db.get(args.postId);
        if(!post) throw new Error('Post not found')
        // verify ownership
    if(post.userId !==currentUser._id) throw new Error('Not authorized to delete this post')
    const likes = await ctx.db.query('likes').withIndex('by_post', (q)=> q.eq('postId', args.postId)).collect()
for (const like of likes) {
    await ctx.db.delete(like._id)
    // delete bookmarks
}
const notifications = await ctx.db.query('notifications').withIndex('by_postId', (q)=> q.eq('postId', args.postId)).collect()
for (const notification of notifications) {
    await ctx.db.delete(notification._id)
}
const comments = await ctx.db.query('comments').withIndex('by_post', (q)=> q.eq('postId', args.postId)).collect()
for (const comment of comments) {
    await ctx.db.delete(comment._id)
}
const bookMakrs = await ctx.db.query('bookmarks').withIndex('by_post', (q)=> q.eq('postId', args.postId)).collect()
for (const bookmark of bookMakrs) {
    await ctx.db.delete(bookmark._id)
}
// delete image
await ctx.storage.delete(post.storageId)
await ctx.db.delete(args.postId);
await ctx.db.patch(currentUser._id, {
    posts: Math.max(0, (currentUser.posts || 1) -1)
})
    }
})



export const getPostsByUser = query({
    args: {
        userId: v.optional(v.id('users'))
    }, 
    handler: async (ctx, args) =>  {
        const user = await getAuthenticatedUser(ctx)
        if(!user) throw new Error('User not found')
        const posts = await ctx.db.query('posts').withIndex('by_user', (q)=> q.eq('userId', args.userId || user._id)).collect()
    return posts;
    }
})