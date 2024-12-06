import { redirect } from '@remix-run/node';
import shopify from '../shopify.server';
import { createUserSession } from '../session.server';

export const loader = async ({ request }) => {
	console.log('🎈 auth.callback.jsx:', request.url);
	try {
		const session = await shopify.authenticate.callback(request);
		const { accessToken, shop } = session;

		// Save the session and redirect to the login page
		return await createUserSession({ accessToken, shopId: shop }, 'shopify', '/gsan/login');
	} catch (error) {
		console.error('❌ Error during Shopify OAuth callback:', error);
		return redirect(`/error?message=Authentication failed`);
	}
};
