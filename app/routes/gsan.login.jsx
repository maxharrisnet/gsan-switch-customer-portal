import { Layout } from '../components/layout/Layout';
import { useActionData } from '@remix-run/react';
import { useUser } from '../context/UserContext';

export const action = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');

	if (!email || !password) {
		return { error: 'Email and password are required.' }, { status: 400 };
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
				variables: { input: { email, password } },
			}),
		});

		const result = await response.json();

		if (result.errors || result.data.customerAccessTokenCreate.userErrors.length) {
			return json({ error: 'Invalid login credentials.' }, { status: 401 });
		}

		return {
			token: result.data.customerAccessTokenCreate.customerAccessToken,
		};
	} catch (error) {
		console.error('❌ Error during customer login:', error);
		return { error: 'An unexpected error occurred.' }, { status: 500 };
	}
};

export default function Login() {
	const actionData = useActionData();
	const { shop } = useUser();

	return (
		<Layout>
			<div className='container'>
				<h1>GSAN Customer Portal</h1>
				<div className='content-centered'>
					<img
						src='/assets/images/GSAN-logo.png'
						alt='GSAN Logo'
						className='login-logo'
					/>
					<form method='post'>
						<div className='form-group'>
							<label
								htmlFor='email'
								className='sr-only'
							>
								Email
							</label>
							<input
								type='email'
								id='email'
								name='email'
								placeholder='Email'
								required
							/>
							<label
								htmlFor='password'
								className='sr-only'
							>
								Password
							</label>
							<input
								type='password'
								id='password'
								name='password'
								placeholder='Password'
								required
							/>
							<input
								type='hidden'
								name='shop'
								value={shop}
							/>
							{/* Add this line */}
							<button type='submit'>Login</button>
							{actionData?.errors && (
								<div>
									<h2>Errors:</h2>
									<ul>
										{actionData.errors.map((error, index) => (
											<li key={index}>{error.message}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</form>
				</div>
			</div>
		</Layout>
	);
}
