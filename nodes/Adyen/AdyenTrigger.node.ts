/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { calculateHmacSignature, logLicensingNotice } from './GenericFunctions';
import type { IAdyenCredentials, IAdyenWebhookNotification } from './types';

export class AdyenTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adyen Trigger',
		name: 'adyenTrigger',
		icon: 'file:adyen.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receive Adyen webhook notifications',
		defaults: { name: 'Adyen Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'adyenApi', required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['AUTHORISATION'],
				options: [
					{ name: 'Authorisation', value: 'AUTHORISATION' },
					{ name: 'Cancellation', value: 'CANCELLATION' },
					{ name: 'Capture', value: 'CAPTURE' },
					{ name: 'Capture Failed', value: 'CAPTURE_FAILED' },
					{ name: 'Chargeback', value: 'CHARGEBACK' },
					{ name: 'Chargeback Reversed', value: 'CHARGEBACK_REVERSED' },
					{ name: 'Notification of Chargeback', value: 'NOTIFICATION_OF_CHARGEBACK' },
					{ name: 'Notification of Fraud', value: 'NOTIFICATION_OF_FRAUD' },
					{ name: 'Payout Decline', value: 'PAYOUT_DECLINE' },
					{ name: 'Payout Expire', value: 'PAYOUT_EXPIRE' },
					{ name: 'Recurring Contract', value: 'RECURRING_CONTRACT' },
					{ name: 'Refund', value: 'REFUND' },
					{ name: 'Refund Failed', value: 'REFUND_FAILED' },
					{ name: 'Report Available', value: 'REPORT_AVAILABLE' },
					{ name: 'Request for Information', value: 'REQUEST_FOR_INFORMATION' },
					{ name: 'Second Chargeback', value: 'SECOND_CHARGEBACK' },
				],
			},
			{
				displayName: 'Validate HMAC Signature',
				name: 'validateHmac',
				type: 'boolean',
				default: true,
				description: 'Whether to validate the HMAC signature',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{ displayName: 'Accept All Events', name: 'acceptAll', type: 'boolean', default: false },
					{ displayName: 'Filter by Merchant', name: 'filterMerchant', type: 'boolean', default: true },
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> { return true; },
			async create(this: IHookFunctions): Promise<boolean> { return true; },
			async delete(this: IHookFunctions): Promise<boolean> { return true; },
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		logLicensingNotice();

		const body = this.getBodyData() as unknown as IAdyenWebhookNotification;
		const credentials = (await this.getCredentials('adyenApi')) as IAdyenCredentials;
		const events = this.getNodeParameter('events') as string[];
		const validateHmac = this.getNodeParameter('validateHmac') as boolean;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		if (!body.notificationItems || !Array.isArray(body.notificationItems)) {
			throw new NodeOperationError(this.getNode(), 'Invalid webhook payload');
		}

		const returnData: IDataObject[] = [];

		for (const item of body.notificationItems) {
			const notification = item.NotificationRequestItem;
			if (!notification) continue;

			if (validateHmac && credentials.hmacKey) {
				const additionalData = notification.additionalData || {};
				const receivedSignature = additionalData.hmacSignature;
				if (receivedSignature) {
					const expectedSignature = calculateHmacSignature(notification as unknown as IDataObject, credentials.hmacKey);
					if (receivedSignature !== expectedSignature) {
						throw new NodeOperationError(this.getNode(), 'Invalid HMAC signature');
					}
				}
			}

			if (options.filterMerchant !== false && notification.merchantAccountCode !== credentials.merchantAccount) {
				continue;
			}

			if (!options.acceptAll && !events.includes(notification.eventCode)) {
				continue;
			}

			returnData.push({
				eventCode: notification.eventCode,
				success: notification.success === 'true',
				pspReference: notification.pspReference,
				originalReference: notification.originalReference,
				merchantAccountCode: notification.merchantAccountCode,
				merchantReference: notification.merchantReference,
				amount: notification.amount,
				eventDate: notification.eventDate,
				paymentMethod: notification.paymentMethod,
				reason: notification.reason,
				additionalData: notification.additionalData,
				live: body.live === 'true',
			});
		}

		return {
			webhookResponse: '[accepted]',
			workflowData: [this.helpers.returnJsonArray(returnData)],
		};
	}
}
