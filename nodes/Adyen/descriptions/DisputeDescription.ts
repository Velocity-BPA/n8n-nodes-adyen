/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const disputeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['dispute'] } },
		options: [
			{ name: 'Accept', value: 'accept', description: 'Accept a dispute', action: 'Accept a dispute' },
			{ name: 'Defend', value: 'defend', description: 'Defend a dispute', action: 'Defend a dispute' },
			{ name: 'Delete Document', value: 'deleteDocument', description: 'Delete a defense document', action: 'Delete a defense document' },
			{ name: 'Get Defense Reasons', value: 'getDefenseReasons', description: 'Get applicable defense reasons', action: 'Get defense reasons' },
			{ name: 'Supply Document', value: 'supplyDocument', description: 'Upload a defense document', action: 'Supply a defense document' },
		],
		default: 'getDefenseReasons',
	},
];

export const disputeFields: INodeProperties[] = [
	{
		displayName: 'Dispute PSP Reference',
		name: 'disputePspReference',
		type: 'string',
		required: true,
		default: '',
		description: 'The pspReference of the dispute',
		displayOptions: { show: { resource: ['dispute'] } },
	},
	{
		displayName: 'Defense Reason Code',
		name: 'defenseReasonCode',
		type: 'string',
		required: true,
		default: '',
		description: 'The defense reason code (from Get Defense Reasons)',
		displayOptions: { show: { resource: ['dispute'], operation: ['defend'] } },
	},
	{
		displayName: 'Document Type Code',
		name: 'defenseDocumentTypeCode',
		type: 'string',
		required: true,
		default: '',
		description: 'The type of defense document (e.g., DefenseMaterial)',
		displayOptions: { show: { resource: ['dispute'], operation: ['supplyDocument'] } },
	},
	{
		displayName: 'Document Content (Base64)',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		description: 'The base64-encoded content of the document',
		displayOptions: { show: { resource: ['dispute'], operation: ['supplyDocument'] } },
	},
	{
		displayName: 'Content Type',
		name: 'contentType',
		type: 'options',
		required: true,
		default: 'application/pdf',
		description: 'The MIME type of the document',
		options: [
			{ name: 'PDF', value: 'application/pdf' },
			{ name: 'PNG', value: 'image/png' },
			{ name: 'JPEG', value: 'image/jpeg' },
		],
		displayOptions: { show: { resource: ['dispute'], operation: ['supplyDocument'] } },
	},
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'string',
		required: true,
		default: '',
		description: 'The type of document to delete',
		displayOptions: { show: { resource: ['dispute'], operation: ['deleteDocument'] } },
	},
];
