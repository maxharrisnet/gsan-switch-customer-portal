import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { json } from '@remix-run/node';
import { useUser } from '../context/UserContext';
import shopify from '../shopify.server';

export async function loader({ request }) {
	console.log('🎈 Request URL:', request.url);
	const shop = new URL(request.url).searchParams.get('shop');
	if (!shop) {
		throw new Error('🟡 Shop parameter is missing from the request URL.');
	}
	console.log('🔐 Fetching Shopify customers from app/routes/customers.jsx');
	const { admin } = await shopify.authenticate.admin(request);
	console.log('🔐 Admin:', admin);

	const shopifyResponse = await admin.graphql(
		`#graphql
    query getShopifyCustomers {
      customers(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            email
          }
        }
      }
    }`
	);

	const customers = shopifyResponse.customers.edges.map((edge) => edge.node);
	return json({ customers });
}

export default function Customers() {
	const { customers } = useLoaderData();
	const { addShopToRequest } = useUser();

	useEffect(() => {
		const fetchCustomers = async () => {
			const request = new Request('/api/customers', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const modifiedRequest = addShopToRequest(request);

			const response = await fetch(modifiedRequest);
			const data = await response.json();
			setCustomers(data.customers);
		};

		fetchCustomers();
	}, [addShopToRequest]);

	return (
		<div>
			<h1>Customers</h1>
			<ul>
				{customers.map((customer) => (
					<li key={customer.id}>
						{customer.firstName} {customer.lastName} - {customer.email}
					</li>
				))}
			</ul>
		</div>
	);
}
