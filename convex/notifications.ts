import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";


export const getNotifications = query({
    handler: async (ctx)=> {
        const user = await getAuthenticatedUser(ctx)
        const notfications = await ctx.db.query('notifications').withIndex('by_receiver', (q)=> q.eq('receiverId', user._id)).order('desc').collect()
        const notificationsWithInfo = await Promise.all(
            notfications.map(async (notification)=> {
                const sender = await ctx.db.get(notification.senderId)
                let post = null;
                let comment = null;
                if(notification.postId) {
                    post = await ctx.db.get(notification.postId)
                }
                if(notification.type === 'comment' && notification.commentId) {
                    comment = await ctx.db.get(notification.commentId)
                }
                return {
                    ...notification,
                    sender: {
                        _id: sender?._id,
                        username: sender?.username,
                        image: sender?.image
                    },
                    post,
                    comment:comment?.content
                }
            })
        )
        return notificationsWithInfo;

    }
})