import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from 'svix';
import { api } from './_generated/api';

const http = httpRouter();

http.route({
    path: '/clerk-webhook',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return new Response('Webhook secret not configured', {
                status: 500
            });
        }

        const svix_id = request.headers.get('svix-id');
        const svix_signature = request.headers.get('svix-signature');
        const svix_timestamp = request.headers.get('svix-timestamp');
        
        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response('Error occurred - missing svix headers', {
                status: 400
            });
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);
        const wh = new Webhook(webhookSecret);
        
        let evt: any;
        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature
            }) as any;
        } catch (error) {
            console.error('Error occurred while trying to verify webhook', error);
            return new Response('An error occurred', {
                status: 400
            });
        }

        const eventType = evt.type;
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;
            const email = email_addresses[0].email_address;
            const fullName = `${first_name} ${last_name}`;
            
            try {
                await ctx.runMutation(api.users.createUser, {
                    email,
                    fullName,
                    image: image_url,
                    clerkId: id,
                    username: email.split('@')[0],
                });
                return new Response('User created successfully', { status: 200 });
            } catch (error) {
                console.error('Error creating user:', error);
                return new Response('Error creating user', {
                    status: 500
                });
            }
        }

        return new Response('Event type not handled', { status: 200 });
    })
});

export default http;