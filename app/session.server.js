import { createCookieSessionStorage, redirect } from '@remix-run/node';

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'user_session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
});

export default async function createUserSession(userData, authType, redirectTo) {
	console.log('🐣 Creating session for auth type:', authType);
	const session = await sessionStorage.getSession();

	if (authType === 'sonar') {
		session.set('user', {
			authType,
			userId: userData.contact_id,
			accountId: userData.account_id,
			username: userData.username,
			contactName: userData.contact_name,
		});
	} else if (authType === 'shopify') {
		session.set('user', {
			authType,
			accessToken: userData.accessToken,
			shopId: userData.shopId,
		});
	} else {
		throw new Error('Unknown authentication type');
	}

	const headers = { 'Set-Cookie': await sessionStorage.commitSession(session) };
	return redirect(redirectTo, { headers });
}

export async function getUserSession(request) {
	const session = await sessionStorage.getSession(request.headers.get('Cookie'));
	return session.has('user') ? session.get('user') : null;
}

export async function destroyUserSession(request) {
	const session = await sessionStorage.getSession(request.headers.get('Cookie'));
	console.log('💣 Destroying session:', session);
	return redirect('/gsan/login', {
		headers: {
			'Set-Cookie': await sessionStorage.destroySession(session),
		},
	});
}
