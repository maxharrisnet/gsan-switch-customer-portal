import { redirect } from '@remix-run/node';
import { login } from '../../shopify.server';

export const loader = async ({ request }) => {
	const url = new URL(request.url);
	const shop = url.searchParams.get('shop');

	if (shop) {
		// Redirect to /auth to handle installation
		console.log('🎈 Detected shop parameter. Redirecting to /auth...');
		return redirect(`/auth?${url.searchParams.toString()}`);
	}

	return { showForm: Boolean(login) };
};
