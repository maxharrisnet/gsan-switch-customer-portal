import '@shopify/shopify-app-remix/adapters/node';
import { ApiVersion, AppDistribution, shopifyApp } from '@shopify/shopify-app-remix/server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-10';
import prisma from './db.server';

console.log('🟢 shopify.server.js');

console.log('⭐ SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY);
console.log('⭐ SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET);
console.log('⭐ SHOPIFY_APP_URL:', process.env.SHOPIFY_APP_URL);
console.log('⭐ SCOPES:', process.env.SCOPES);

const shopify = shopifyApp({
	apiKey: process.env.SHOPIFY_API_KEY,
	apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
	apiVersion: ApiVersion.October24,
	scopes: process.env.SCOPES?.split(','),
	appUrl: process.env.SHOPIFY_APP_URL || '',
	authPathPrefix: '/auth',
	sessionStorage: new PrismaSessionStorage(prisma),
	distribution: AppDistribution.SingleMerchant,
	isEmbeddedApp: false,
	restResources,
	...(process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}),
});

console.log('🚀 Shopify:', shopify);

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
