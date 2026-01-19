/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AdyenApi implements ICredentialType {
	name = 'adyenApi';
	displayName = 'Adyen API';
	documentationUrl = 'https://docs.adyen.com/development-resources/api-credentials';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Test', value: 'test' },
				{ name: 'Live (EU)', value: 'live-eu' },
				{ name: 'Live (US)', value: 'live-us' },
				{ name: 'Live (AU)', value: 'live-au' },
			],
			default: 'test',
			description: 'The Adyen environment to connect to',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your Adyen API key from the Customer Area',
		},
		{
			displayName: 'Merchant Account',
			name: 'merchantAccount',
			type: 'string',
			required: true,
			default: '',
			description: 'Your Adyen merchant account name',
		},
		{
			displayName: 'HMAC Key (for Webhooks)',
			name: 'hmacKey',
			type: 'string',
			typeOptions: { password: true },
			required: false,
			default: '',
			description: 'HMAC key for webhook signature validation',
		},
		{
			displayName: 'Live URL Prefix',
			name: 'liveUrlPrefix',
			type: 'string',
			required: false,
			default: '',
			description: 'Your unique live URL prefix (required for live environments)',
			displayOptions: {
				show: {
					environment: ['live-eu', 'live-us', 'live-au'],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-API-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "test" ? "https://management-test.adyen.com" : "https://management-live.adyen.com"}}',
			url: '/v3/me',
			method: 'GET',
		},
	};
}
