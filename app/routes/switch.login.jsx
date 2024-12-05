import axios from 'axios';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { createUserSession } from '../session.server';
import authenticateSonarUser from '../sonar.server';
import Layout from '../components/layout/Layout';

export async function action({ request }) {
	const formData = await request.formData();
	const username = formData.get('username');
	const password = formData.get('password');

	try {
		const sonarAuth = await authenticateSonarUser(username, password);

		if (sonarAuth.success) {
			return createUserSession(sonarAuth.userData, 'sonar', '/performance');
		} else {
			return json({ error: sonarAuth.error }, { status: 401 });
		}
	} catch (error) {
		console.error('Sonar customer login error:', error);
		return json({ errors: [{ message: 'An error occurred during sonar login' }] });
	}
}

export default function SonarLogin() {
	const actionData = useActionData();
	return (
		<Layout>
			<div className='container'>
				<h1>Switch Customer Portal</h1>
				<div className='content-centered'>
					<img
						src='/assets/images/switch-logo.png'
						alt='Switch Logo'
						className='login-logo'
					/>
					<Form method='post'>
						<div className='form-group'>
							<label
								htmlFor='sonarUsername'
								className='sr-only'
							>
								Username
							</label>
							<input
								type='text'
								name='username'
								placeholder='Username'
								id='sonarUsername'
								required
							/>
							<label
								htmlFor='sonarPassword'
								className='sr-only'
							>
								Password
							</label>
							<input
								type='password'
								name='password'
								placeholder='Password'
								id='sonarPassword'
								required
							/>
							<button type='submit'>Log in with Switch</button>
							{actionData?.error && <p>{actionData.error}</p>}
						</div>
					</Form>
				</div>
			</div>
		</Layout>
	);
}
