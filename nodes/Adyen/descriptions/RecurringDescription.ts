/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const recurringOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['recurring'] } },
		options: [
			{ name: 'Create Stored Method', value: 'create', description: 'Store a payment method', action: 'Create a stored payment method' },
			{ name: 'Delete Stored Method', value: 'delete', description: 'Remove a stored payment method', action: 'Delete a stored payment method' },
			{ name: 'List Stored Methods', value: 'list', description: 'Get stored payment methods', action: 'List stored payment methods' },
		],
		default: 'list',
	},
];

export const recurringFields: INodeProperties[] = [
	{
		displayName: 'Shopper Reference',
		name: 'shopperReference',
		type: 'string',
		required: true,
		default: '',
		description: 'Your unique identifier for the shopper',
		displayOptions: { show: { resource: ['recurring'], operation: ['list', 'create'] } },
	},
	{
		displayName: 'Stored Payment Method ID',
		name: 'storedPaymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the stored payment method to delete',
		displayOptions: { show: { resource: ['recurring'], operation: ['delete'] } },
	},
	{
		displayName: 'Payment Method Type',
		name: 'paymentMethodType',
		type: 'options',
		required: true,
		default: 'scheme',
		description: 'The type of payment method to store',
		options: [
			{ name: 'Card (scheme)', value: 'scheme' },
			{ name: 'SEPA Direct Debit', value: 'sepadirectdebit' },
		],
		displayOptions: { show: { resource: ['recurring'], operation: ['create'] } },
	},
	{
		displayName: 'Encrypted Card Number',
		name: 'encryptedCardNumber',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		description: 'The encrypted card number from Adyen Web SDK',
		displayOptions: { show: { resource: ['recurring'], operation: ['create'], paymentMethodType: ['scheme'] } },
	},
	{
		displayName: 'Encrypted Expiry Month',
		name: 'encryptedExpiryMonth',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		description: 'The encrypted expiry month from Adyen Web SDK',
		displayOptions: { show: { resource: ['recurring'], operation: ['create'], paymentMethodType: ['scheme'] } },
	},
	{
		displayName: 'Encrypted Expiry Year',
		name: 'encryptedExpiryYear',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		description: 'The encrypted expiry year from Adyen Web SDK',
		displayOptions: { show: { resource: ['recurring'], operation: ['create'], paymentMethodType: ['scheme'] } },
	},
	{
		displayName: 'IBAN',
		name: 'iban',
		type: 'string',
		required: true,
		default: '',
		description: 'The IBAN of the bank account',
		displayOptions: { show: { resource: ['recurring'], operation: ['create'], paymentMethodType: ['sepadirectdebit'] } },
	},
	{
		displayName: 'Owner Name',
		name: 'ownerName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the bank account holder',
		displayOptions: { show: { resource: ['recurring'], operation: ['create'], paymentMethodType: ['sepadirectdebit'] } },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['recurring'], operation: ['create'] } },
		options: [
			{ displayName: 'Holder Name', name: 'holderName', type: 'string', default: '', description: 'The cardholder name' },
			{ displayName: 'Shopper Email', name: 'shopperEmail', type: 'string', default: '', description: 'The shopper\'s email address' },
		],
	},
];
