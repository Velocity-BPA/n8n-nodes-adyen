/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const paymentLinkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['paymentLink'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a payment link', action: 'Create a payment link' },
			{ name: 'Get', value: 'get', description: 'Retrieve a payment link', action: 'Get a payment link' },
			{ name: 'Update', value: 'update', description: 'Update a payment link status', action: 'Update a payment link' },
		],
		default: 'create',
	},
];

export const paymentLinkFields: INodeProperties[] = [
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'The payment amount in major units',
		displayOptions: { show: { resource: ['paymentLink'], operation: ['create'] } },
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		required: true,
		default: 'USD',
		description: 'The three-character ISO currency code',
		displayOptions: { show: { resource: ['paymentLink'], operation: ['create'] } },
	},
	{
		displayName: 'Reference',
		name: 'reference',
		type: 'string',
		required: true,
		default: '',
		description: 'Your unique reference for this payment link',
		displayOptions: { show: { resource: ['paymentLink'], operation: ['create'] } },
	},
	{
		displayName: 'Link ID',
		name: 'linkId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the payment link',
		displayOptions: { show: { resource: ['paymentLink'], operation: ['get', 'update'] } },
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'expired',
		description: 'The new status for the payment link',
		options: [{ name: 'Expired', value: 'expired' }],
		displayOptions: { show: { resource: ['paymentLink'], operation: ['update'] } },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['paymentLink'], operation: ['create'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'A description of the payment' },
			{ displayName: 'Return URL', name: 'returnUrl', type: 'string', default: '', description: 'URL to redirect the shopper after payment' },
			{ displayName: 'Reusable', name: 'reusable', type: 'boolean', default: false, description: 'Whether the payment link can be used multiple times' },
			{ displayName: 'Expires At', name: 'expiresAt', type: 'dateTime', default: '', description: 'When the payment link expires' },
			{ displayName: 'Country Code', name: 'countryCode', type: 'string', default: '', description: 'The two-character country code' },
			{ displayName: 'Shopper Email', name: 'shopperEmail', type: 'string', default: '', description: 'The shopper\'s email address' },
			{ displayName: 'Shopper Reference', name: 'shopperReference', type: 'string', default: '', description: 'Your unique identifier for the shopper' },
		],
	},
];
