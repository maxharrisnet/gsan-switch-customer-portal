import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
	try {
		console.log('🎈 Starting admin authentication');
		await authenticate.admin(request);
		return null; // Shopify handles redirection
	} catch (error) {
		console.error('❌ Shopify authentication error:', error.message);
		throw new Response('Authentication failed. Please try again later.', {
			status: 500,
		});
	}
};
