import { redirect } from '@remix-run/node';
import crypto from 'crypto';

function validateHmac(queryParams, hmac) {
	const secret = process.env.SHOPIFY_API_SECRET;

	// Exclude 'hmac' from the calculation
	const sortedParams = Object.keys(queryParams)
		.filter((key) => key !== 'hmac')
		.sort()
		.map((key) => `${key}=${decodeURIComponent(queryParams[key])}`) // Decode each value
		.join('&');

	console.log('🔍 Sorted Query Parameters for HMAC:', sortedParams);

	const calculatedHmac = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');

	console.log('🔑 Calculated HMAC:', calculatedHmac);
	console.log('🔑 Provided HMAC:', hmac);

	return calculatedHmac === hmac;
}

export const loader = async ({ request }) => {
	const url = new URL(request.url);
	const queryParams = Object.fromEntries(url.searchParams.entries());
	const hmac = queryParams.hmac;
	const code = queryParams.code;

	console.log('🔐 Authenticating Shopify app:', queryParams);

	if (!queryParams.shop || !hmac) {
		throw new Response('Missing shop or hmac parameter', { status: 400 });
	}

	if (!validateHmac(queryParams, hmac)) {
		console.error('❌ HMAC validation failed.');
		return new Response('Invalid HMAC', { status: 403 });
	}

	if (!code) {
		console.error('❌ Missing authorization code.');
		return new Response('Missing authorization code', { status: 400 });
	}

	try {
		// Exchange authorization code for access token
		const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_id: process.env.SHOPIFY_API_KEY,
				client_secret: process.env.SHOPIFY_API_SECRET,
				code,
			}),
		});

		if (!tokenResponse.ok) {
			console.error('❌ Error fetching access token:', await tokenResponse.text());
			throw new Response('Failed to fetch access token', { status: 500 });
		}

		const { access_token: accessToken } = await tokenResponse.json();

		// Store access token securely (e.g., in session)
		console.log('✅ Successfully retrieved access token:', accessToken);

		// Redirect to app's dashboard
		return redirect(`/dashboard?shop=${shop}`);
	} catch (error) {
		console.error('❌ Error during authentication:', error);
		return redirect('/error?message=Authentication failed');
	}
};
