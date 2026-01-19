/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const modificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['modification'] } },
		options: [
			{ name: 'Cancel', value: 'cancel', description: 'Cancel an authorized payment', action: 'Cancel a payment' },
			{ name: 'Capture', value: 'capture', description: 'Capture an authorized payment', action: 'Capture a payment' },
			{ name: 'Refund', value: 'refund', description: 'Refund a captured payment', action: 'Refund a payment' },
			{ name: 'Reverse', value: 'reverse', description: 'Reverse a payment (cancel or refund)', action: 'Reverse a payment' },
			{ name: 'Update Amount', value: 'updateAmount', description: 'Update the authorized amount', action: 'Update payment amount' },
		],
		default: 'capture',
	},
];

export const modificationFields: INodeProperties[] = [
	{
		displayName: 'PSP Reference',
		name: 'pspReference',
		type: 'string',
		required: true,
		default: '',
		description: 'The pspReference of the original payment',
		displayOptions: { show: { resource: ['modification'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'The amount in major units',
		displayOptions: { show: { resource: ['modification'], operation: ['capture', 'refund', 'updateAmount'] } },
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		required: true,
		default: 'USD',
		description: 'The three-character ISO currency code',
		displayOptions: { show: { resource: ['modification'], operation: ['capture', 'refund', 'updateAmount'] } },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['modification'] } },
		options: [
			{ displayName: 'Reference', name: 'reference', type: 'string', default: '', description: 'Your reference for this modification' },
			{ displayName: 'Industry Usage', name: 'industryUsage', type: 'options', options: [{ name: 'Delayed Charge', value: 'delayedCharge' }, { name: 'No Show', value: 'noShow' }], default: 'delayedCharge', description: 'The reason for the amount update' },
		],
	},
];
