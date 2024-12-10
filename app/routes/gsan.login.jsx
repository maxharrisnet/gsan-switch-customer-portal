import { useActionData } from '@remix-run/react';
import shopify from '../shopify.server';
import { createUserSession } from '../session.server';
import Layout from '../components/layout/Layout';

const customerLoginMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const action = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');

	if (!email || !password) {
		return { errors: [{ message: 'Email and password are required.' }] }, { status: 400 };
	}

	try {
		console.log('🔵 shopName:', process.env.SHOPIFY_STORE_DOMAIN);
		const { storefront } = await shopify.unauthenticated.storefront(process.env.SHOPIFY_STORE_DOMAIN);

		const response = await storefront.query({
			data: customerLoginMutation,
			variables: { input: { email, password } },
		});

		console.log('🟢 Customer login response:', response);

		const { customerAccessTokenCreate } = response.body.data;

		if (customerAccessTokenCreate.customerUserErrors.length) {
			return { errors: customerAccessTokenCreate.customerUserErrors }, { status: 401 };
		}

		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		return createUserSession({ accessToken, expiresAt }, '/dashboard');
	} catch (error) {
		console.error('Error during customer login:', error);
		return { errors: [{ message: 'An unexpected error occurred. Please try again.' }] }, { status: 500 };
	}
};

export default function Login() {
	const actionData = useActionData();

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
							<button type='submit'>Login</button>
						</div>
						{actionData?.errors && (
							<div className='error-messages'>
								<h2>Errors:</h2>
								<ul>
									{actionData.errors.map((error, index) => (
										<li key={index}>{error.message}</li>
									))}
								</ul>
							</div>
						)}
					</form>
				</div>
			</div>
		</Layout>
	);
}
