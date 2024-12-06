import { Link } from '@remix-run/react';
import Layout from '../components/layout/Layout';
import { useUser } from '../context/UserContext';

export default function Login() {
	const { shop } = useUser();
	const gsanLoginUrl = `/gsan/login${shop ? `?shop=${shop}` : ''}`;

	return (
		<Layout>
			<div className='container'>
				<h1>Customer Portal Login</h1>
				<div className=' content-centered'>
					<div className='button-wrapper login-button-wrapper'>
						<div>
							<img
								src='/assets/images/GSAN-logo.png'
								alt='GSAN Logo'
							/>
							<Link
								to={gsanLoginUrl}
								className='button'
							>
								Login with GSAN
							</Link>
						</div>
						<div>
							<img
								src='/assets/images/switch-logo.png'
								alt='Switch Logo'
							/>
							<Link
								to='/switch/login'
								className='button'
							>
								Login with Switch
							</Link>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}