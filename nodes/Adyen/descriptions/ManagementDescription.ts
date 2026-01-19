/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const managementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['management'] } },
		options: [
			{ name: 'Create Store', value: 'createStore', description: 'Create a store', action: 'Create a store' },
			{ name: 'Create Webhook', value: 'createWebhook', description: 'Create a webhook configuration', action: 'Create a webhook' },
			{ name: 'Get Company', value: 'getCompany', description: 'Get company details', action: 'Get a company' },
			{ name: 'Get Merchant', value: 'getMerchant', description: 'Get merchant details', action: 'Get a merchant' },
			{ name: 'List Companies', value: 'listCompanies', description: 'List company accounts', action: 'List companies' },
			{ name: 'List Merchants', value: 'listMerchants', description: 'List merchant accounts', action: 'List merchants' },
			{ name: 'List Stores', value: 'listStores', description: 'List stores for a merchant', action: 'List stores' },
			{ name: 'List Webhooks', value: 'listWebhooks', description: 'List webhook configurations', action: 'List webhooks' },
		],
		default: 'listMerchants',
	},
];

export const managementFields: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the company',
		displayOptions: { show: { resource: ['management'], operation: ['getCompany'] } },
	},
	{
		displayName: 'Merchant ID',
		name: 'merchantId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the merchant account',
		displayOptions: { show: { resource: ['management'], operation: ['getMerchant', 'listStores', 'createStore', 'listWebhooks', 'createWebhook'] } },
	},
	{
		displayName: 'Store Reference',
		name: 'reference',
		type: 'string',
		required: true,
		default: '',
		description: 'Your reference for this store',
		displayOptions: { show: { resource: ['management'], operation: ['createStore'] } },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		description: 'A description of the store',
		displayOptions: { show: { resource: ['management'], operation: ['createStore'] } },
	},
	{
		displayName: 'Shopper Statement',
		name: 'shopperStatement',
		type: 'string',
		required: true,
		default: '',
		description: 'The name shown on the shopper\'s bank statement',
		displayOptions: { show: { resource: ['management'], operation: ['createStore'] } },
	},
	{
		displayName: 'Store Address',
		name: 'storeAddress',
		type: 'collection',
		placeholder: 'Add Address Field',
		default: {},
		displayOptions: { show: { resource: ['management'], operation: ['createStore'] } },
		options: [
			{ displayName: 'Street', name: 'line1', type: 'string', default: '' },
			{ displayName: 'City', name: 'city', type: 'string', default: '' },
			{ displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
			{ displayName: 'State/Province', name: 'stateOrProvince', type: 'string', default: '' },
			{ displayName: 'Country', name: 'country', type: 'string', default: '', description: 'Two-letter country code' },
		],
	},
	{
		displayName: 'Webhook URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		description: 'The URL where webhooks will be sent',
		displayOptions: { show: { resource: ['management'], operation: ['createWebhook'] } },
	},
	{
		displayName: 'Webhook Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'standard',
		options: [{ name: 'Standard', value: 'standard' }, { name: 'Account', value: 'account' }],
		displayOptions: { show: { resource: ['management'], operation: ['createWebhook'] } },
	},
	{
		displayName: 'Communication Format',
		name: 'communicationFormat',
		type: 'options',
		required: true,
		default: 'json',
		options: [{ name: 'JSON', value: 'json' }, { name: 'HTTP', value: 'http' }, { name: 'SOAP', value: 'soap' }],
		displayOptions: { show: { resource: ['management'], operation: ['createWebhook'] } },
	},
	{
		displayName: 'Active',
		name: 'active',
		type: 'boolean',
		default: true,
		description: 'Whether the webhook is active',
		displayOptions: { show: { resource: ['management'], operation: ['createWebhook'] } },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['management'], operation: ['listCompanies', 'listMerchants', 'listStores', 'listWebhooks'] } },
		options: [
			{ displayName: 'Page Size', name: 'pageSize', type: 'number', default: 10, description: 'The number of items to return per page' },
			{ displayName: 'Page Number', name: 'pageNumber', type: 'number', default: 1, description: 'The page number to return' },
		],
	},
];
