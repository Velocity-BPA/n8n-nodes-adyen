/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';
import type { AdyenEnvironment, IAdyenCredentials } from './types';

let licensingNoticeLogged = false;

/**
 * Logs the Velocity BPA licensing notice once per node load.
 * Non-blocking, informational only.
 */
export function logLicensingNotice(): void {
	if (!licensingNoticeLogged) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
		licensingNoticeLogged = true;
	}
}

/**
 * Returns the base URL for the specified Adyen API and environment.
 */
export function getBaseUrl(
	environment: AdyenEnvironment,
	api: 'checkout' | 'management' | 'disputes' | 'balancePlatform',
	liveUrlPrefix?: string,
): string {
	const baseUrls: Record<AdyenEnvironment, Record<string, string>> = {
		test: {
			checkout: 'https://checkout-test.adyen.com',
			management: 'https://management-test.adyen.com',
			disputes: 'https://ca-test.adyen.com/ca/services/DisputeService',
			balancePlatform: 'https://balanceplatform-api-test.adyen.com',
		},
		'live-eu': {
			checkout: liveUrlPrefix
				? `https://${liveUrlPrefix}-checkout-live.adyen.com/checkout`
				: 'https://checkout-live.adyen.com',
			management: 'https://management-live.adyen.com',
			disputes: 'https://ca-live.adyen.com/ca/services/DisputeService',
			balancePlatform: 'https://balanceplatform-api-live.adyen.com',
		},
		'live-us': {
			checkout: liveUrlPrefix
				? `https://${liveUrlPrefix}-checkout-live-us.adyen.com/checkout`
				: 'https://checkout-live-us.adyen.com',
			management: 'https://management-live.adyen.com',
			disputes: 'https://ca-live.adyen.com/ca/services/DisputeService',
			balancePlatform: 'https://balanceplatform-api-live.adyen.com',
		},
		'live-au': {
			checkout: liveUrlPrefix
				? `https://${liveUrlPrefix}-checkout-live-au.adyen.com/checkout`
				: 'https://checkout-live-au.adyen.com',
			management: 'https://management-live.adyen.com',
			disputes: 'https://ca-live.adyen.com/ca/services/DisputeService',
			balancePlatform: 'https://balanceplatform-api-live.adyen.com',
		},
	};

	return baseUrls[environment][api];
}

/**
 * Generates a unique idempotency key for POST requests.
 */
export function generateIdempotencyKey(): string {
	return `${Date.now()}-${crypto.randomUUID()}`;
}

/**
 * Makes an authenticated request to the Adyen API.
 */
export async function adyenApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	api: 'checkout' | 'management' | 'disputes' | 'balancePlatform' = 'checkout',
): Promise<IDataObject> {
	const credentials = (await this.getCredentials('adyenApi')) as IAdyenCredentials;
	const baseUrl = getBaseUrl(credentials.environment, api, credentials.liveUrlPrefix);

	const options: IRequestOptions = {
		method,
		body,
		qs: query,
		uri: `${baseUrl}${endpoint}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
		},
	};

	if (method === 'POST') {
		options.headers = {
			...options.headers,
			'Idempotency-Key': generateIdempotencyKey(),
		};
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		const response = await this.helpers.requestWithAuthentication.call(this, 'adyenApi', options);
		return response as IDataObject;
	} catch (error) {
		const err = error as { message?: string; description?: string };
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: err.message,
			description: err.description,
		});
	}
}

/**
 * Calculates the HMAC signature for webhook validation.
 */
export function calculateHmacSignature(
	notificationRequestItem: IDataObject,
	hmacKey: string,
): string {
	const signedFields = [
		'pspReference',
		'originalReference',
		'merchantAccountCode',
		'merchantReference',
		'amount.value',
		'amount.currency',
		'eventCode',
		'success',
	];

	const signedData: string[] = [];
	for (const field of signedFields) {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			const parentObj = notificationRequestItem[parent] as IDataObject | undefined;
			signedData.push(String(parentObj?.[child] ?? ''));
		} else {
			signedData.push(String(notificationRequestItem[field] ?? ''));
		}
	}

	const signingString = signedData.join(':');
	const keyBuffer = Buffer.from(hmacKey, 'hex');
	return crypto.createHmac('sha256', keyBuffer).update(signingString, 'utf8').digest('base64');
}

/**
 * Formats an amount to Adyen's minor units format.
 */
export function formatAmount(
	amount: number,
	currency: string,
): { value: number; currency: string } {
	const zeroDecimalCurrencies = [
		'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW',
		'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
	];
	const threeDecimalCurrencies = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];

	let value: number;
	if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
		value = Math.round(amount);
	} else if (threeDecimalCurrencies.includes(currency.toUpperCase())) {
		value = Math.round(amount * 1000);
	} else {
		value = Math.round(amount * 100);
	}

	return { value, currency: currency.toUpperCase() };
}
