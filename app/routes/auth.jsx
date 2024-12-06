import { redirect } from '@remix-run/node';
import shopify from '../shopify.server';

export const loader = async ({ request }) => {
	console.log('🎈 auth.jsx:', request.url);
	const shop = process.env.SHOPIFY_SHOP_NAME; // Single store domain

	if (!shop) {
		throw new Error('The shop domain is not configured.');
	}

	try {
		const authUrl = await shopify.authenticate.begin({ shop });
		return redirect(authUrl);
	} catch (error) {
		console.error('❌ Error during Shopify authentication:', error);
		return redirect(`/error?message=Authentication failed`);
	}
};
