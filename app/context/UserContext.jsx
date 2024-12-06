// UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, initialUser, shop }) => {
	const [currentUser, setCurrentUser] = useState(initialUser);

	useEffect(() => {
		setCurrentUser(initialUser);
	}, [initialUser]);

	const addShopToRequest = (request) => {
		const modifiedUrl = new URL(request.url);
		modifiedUrl.searchParams.set('shop', shop);
		return new Request(modifiedUrl, {
			method: request.method,
			headers: request.headers,
			body: request.body,
			redirect: request.redirect,
			signal: request.signal,
		});
	};

	return <UserContext.Provider value={{ currentUser, setCurrentUser, shop, addShopToRequest }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	return useContext(UserContext);
};
