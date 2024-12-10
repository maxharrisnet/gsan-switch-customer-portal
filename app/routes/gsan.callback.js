import { json } from '@remix-run/node';

export const action = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');

	if (!email || !password) {
		return json({ error: 'Email and password are required.' }, { status: 400 });
	}

	try {
		const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-04/graphql.json`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN,
			},
			body: JSON.stringify({
				query: `#graphql
          mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
            customerAccessTokenCreate(input: $input) {
              customerAccessToken {
                accessToken
                expiresAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
				variables: {
					input: { email, password },
				},
			}),
		});

		const result = await response.json();

		if (result.errors || result.data.customerAccessTokenCreate.userErrors.length) {
			return json({ error: 'Invalid login credentials.' }, { status: 401 });
		}

		return json({ token: result.data.customerAccessTokenCreate.customerAccessToken });
	} catch (error) {
		console.error('❌ Error during customer login callback:', error);
		return json({ error: 'An unexpected error occurred.' }, { status: 500 });
	}
};
