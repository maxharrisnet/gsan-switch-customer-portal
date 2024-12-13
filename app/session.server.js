// session.server.js
import { createCookieSessionStorage } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '__session',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
	},
});

export async function createUserSession(accessToken, shop, redirectTo) {
	const session = await sessionStorage.getSession();
	session.set(`accessToken:${shop}`, accessToken);
	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await sessionStorage.commitSession(session),
		},
	});
}

export async function getUserSession(request) {
	const session = await sessionStorage.getSession(request.headers.get('Cookie'));
	return session.data;
}
