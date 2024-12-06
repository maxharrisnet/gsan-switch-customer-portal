import { redirect } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { sessionStorage } from '../sessions.server';

export const loader = async ({ request, params }) => {
	const shop = params.shop;

	if (!shop) {
		throw new Error("Missing 'shop' parameter in the URL.");
	}

	try {
		// Step 1: Check for existing session
		const session = await sessionStorage.getSession(request.headers.get('Cookie'));
		const accessToken = session.get('accessToken');

		if (accessToken) {
			// Session exists, redirect to the main app
			return redirect(`/login?shop=${shop}`);
		}

		// Step 2: Initiate Shopify OAuth if no session exists
		const authUrl = await authenticate.admin(request, { shop });
		return redirect(authUrl);
	} catch (error) {
		console.error('❌ Error in /auth route:', error);
		return redirect(`/error?message=Authentication failed`);
	}
};
