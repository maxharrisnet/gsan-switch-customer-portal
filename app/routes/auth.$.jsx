import shopify from '../shopify.server';

export const loader = async ({ request }) => {
	console.log('🔐 Starting authentication process');
	try {
		const { admin } = await shopify.authenticate.admin(request);
		console.log('🎉 Authentication successful:', admin);
		// Rest of your code
	} catch (error) {
		console.error('❌ Authentication failed:', error);
		// Handle the error
	}
};
