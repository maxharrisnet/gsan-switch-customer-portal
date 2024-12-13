import { redirect } from '@remix-run/node';
import { getUserSession } from '../../session.server';

export const loader = async ({ request }) => {
	const url = new URL(request.url);
	const shop = url.searchParams.get('shop');

	if (!shop) {
		throw new Response('Missing shop parameter', { status: 400 });
	}

	// Check for existing session or access token
	const session = await getUserSession(request);

	if (!session || !session[`accessToken:${shop}`]) {
		return redirect(`/auth?${url.searchParams.toString()}`);
	}

	// Redirect to dashboard if session exists
	return redirect(`/dashboard?shop=${shop}`);
};
