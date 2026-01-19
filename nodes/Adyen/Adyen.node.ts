/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { adyenApiRequest, formatAmount, logLicensingNotice } from './GenericFunctions';
import type { IAdyenCredentials } from './types';

import { checkoutOperations, checkoutFields } from './descriptions/CheckoutDescription';
import { paymentLinkOperations, paymentLinkFields } from './descriptions/PaymentLinkDescription';
import { modificationOperations, modificationFields } from './descriptions/ModificationDescription';
import { recurringOperations, recurringFields } from './descriptions/RecurringDescription';
import { disputeOperations, disputeFields } from './descriptions/DisputeDescription';
import { managementOperations, managementFields } from './descriptions/ManagementDescription';

export class Adyen implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adyen',
		name: 'adyen',
		icon: 'file:adyen.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Enterprise payment processing with Adyen',
		defaults: {
			name: 'Adyen',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'adyenApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Checkout', value: 'checkout', description: 'Sessions, payments, and payment methods' },
					{ name: 'Dispute', value: 'dispute', description: 'Manage chargebacks and disputes' },
					{ name: 'Management', value: 'management', description: 'Companies, merchants, stores, and webhooks' },
					{ name: 'Modification', value: 'modification', description: 'Capture, cancel, refund, and reverse payments' },
					{ name: 'Payment Link', value: 'paymentLink', description: 'Create and manage payment links' },
					{ name: 'Recurring', value: 'recurring', description: 'Stored payment methods' },
				],
				default: 'checkout',
			},
			...checkoutOperations,
			...checkoutFields,
			...paymentLinkOperations,
			...paymentLinkFields,
			...modificationOperations,
			...modificationFields,
			...recurringOperations,
			...recurringFields,
			...disputeOperations,
			...disputeFields,
			...managementOperations,
			...managementFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		logLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = (await this.getCredentials('adyenApi')) as IAdyenCredentials;
		const merchantAccount = credentials.merchantAccount;

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject = {};

				// Checkout Operations
				if (resource === 'checkout') {
					if (operation === 'createSession') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;
						const reference = this.getNodeParameter('reference', i) as string;
						const returnUrl = this.getNodeParameter('returnUrl', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							reference,
							returnUrl,
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/sessions', body);
					}

					if (operation === 'getSession') {
						const sessionId = this.getNodeParameter('sessionId', i) as string;
						const sessionResult = this.getNodeParameter('sessionResult', i, '') as string;

						let endpoint = `/v71/sessions/${sessionId}`;
						if (sessionResult) {
							endpoint += `?sessionResult=${encodeURIComponent(sessionResult)}`;
						}

						responseData = await adyenApiRequest.call(this, 'GET', endpoint);
					}

					if (operation === 'getPaymentMethods') {
						const currency = this.getNodeParameter('currency', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							merchantAccount,
							...additionalOptions,
						};

						if (currency) {
							body.amount = { currency, value: 0 };
						}

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/paymentMethods', body);
					}

					if (operation === 'createPayment') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;
						const reference = this.getNodeParameter('reference', i) as string;
						const returnUrl = this.getNodeParameter('returnUrl', i) as string;
						const paymentMethodType = this.getNodeParameter('paymentMethodType', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						const paymentMethod: IDataObject = { type: paymentMethodType };

						if (paymentMethodType === 'scheme') {
							paymentMethod.encryptedCardNumber = this.getNodeParameter('encryptedCardNumber', i) as string;
							paymentMethod.encryptedExpiryMonth = this.getNodeParameter('encryptedExpiryMonth', i) as string;
							paymentMethod.encryptedExpiryYear = this.getNodeParameter('encryptedExpiryYear', i) as string;
							paymentMethod.encryptedSecurityCode = this.getNodeParameter('encryptedSecurityCode', i) as string;
						} else if (paymentMethodType === 'storedPaymentMethod') {
							paymentMethod.storedPaymentMethodId = this.getNodeParameter('storedPaymentMethodId', i) as string;
						}

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							reference,
							returnUrl,
							paymentMethod,
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/payments', body);
					}

					if (operation === 'submitDetails') {
						const details = this.getNodeParameter('details', i) as string;
						const paymentData = this.getNodeParameter('paymentData', i, '') as string;

						const body: IDataObject = {
							details: JSON.parse(details),
						};

						if (paymentData) {
							body.paymentData = paymentData;
						}

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/payments/details', body);
					}

					if (operation === 'getCardDetails') {
						const cardNumber = this.getNodeParameter('cardNumber', i) as string;

						const body: IDataObject = {
							merchantAccount,
							cardNumber,
						};

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/cardDetails', body);
					}
				}

				// Payment Link Operations
				if (resource === 'paymentLink') {
					if (operation === 'create') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;
						const reference = this.getNodeParameter('reference', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							reference,
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/paymentLinks', body);
					}

					if (operation === 'get') {
						const linkId = this.getNodeParameter('linkId', i) as string;
						responseData = await adyenApiRequest.call(this, 'GET', `/v71/paymentLinks/${linkId}`);
					}

					if (operation === 'update') {
						const linkId = this.getNodeParameter('linkId', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						responseData = await adyenApiRequest.call(this, 'PATCH', `/v71/paymentLinks/${linkId}`, { status });
					}
				}

				// Modification Operations
				if (resource === 'modification') {
					const pspReference = this.getNodeParameter('pspReference', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

					if (operation === 'capture') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', `/v71/payments/${pspReference}/captures`, body);
					}

					if (operation === 'cancel') {
						const body: IDataObject = { merchantAccount, ...additionalOptions };
						responseData = await adyenApiRequest.call(this, 'POST', `/v71/payments/${pspReference}/cancels`, body);
					}

					if (operation === 'refund') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', `/v71/payments/${pspReference}/refunds`, body);
					}

					if (operation === 'reverse') {
						const body: IDataObject = { merchantAccount, ...additionalOptions };
						responseData = await adyenApiRequest.call(this, 'POST', `/v71/payments/${pspReference}/reversals`, body);
					}

					if (operation === 'updateAmount') {
						const amount = this.getNodeParameter('amount', i) as number;
						const currency = this.getNodeParameter('currency', i) as string;

						const body: IDataObject = {
							merchantAccount,
							amount: formatAmount(amount, currency),
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', `/v71/payments/${pspReference}/amountUpdates`, body);
					}
				}

				// Recurring Operations
				if (resource === 'recurring') {
					if (operation === 'list') {
						const shopperReference = this.getNodeParameter('shopperReference', i) as string;
						responseData = await adyenApiRequest.call(
							this,
							'GET',
							`/v71/storedPaymentMethods?merchantAccount=${encodeURIComponent(merchantAccount)}&shopperReference=${encodeURIComponent(shopperReference)}`,
						);
					}

					if (operation === 'delete') {
						const storedPaymentMethodId = this.getNodeParameter('storedPaymentMethodId', i) as string;
						responseData = await adyenApiRequest.call(
							this,
							'DELETE',
							`/v71/storedPaymentMethods/${storedPaymentMethodId}?merchantAccount=${encodeURIComponent(merchantAccount)}`,
						);
					}

					if (operation === 'create') {
						const shopperReference = this.getNodeParameter('shopperReference', i) as string;
						const paymentMethodType = this.getNodeParameter('paymentMethodType', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						const paymentMethod: IDataObject = { type: paymentMethodType };

						if (paymentMethodType === 'scheme') {
							paymentMethod.encryptedCardNumber = this.getNodeParameter('encryptedCardNumber', i) as string;
							paymentMethod.encryptedExpiryMonth = this.getNodeParameter('encryptedExpiryMonth', i) as string;
							paymentMethod.encryptedExpiryYear = this.getNodeParameter('encryptedExpiryYear', i) as string;
							if (additionalOptions.holderName) {
								paymentMethod.holderName = additionalOptions.holderName;
							}
						} else if (paymentMethodType === 'sepadirectdebit') {
							paymentMethod.iban = this.getNodeParameter('iban', i) as string;
							paymentMethod.ownerName = this.getNodeParameter('ownerName', i) as string;
						}

						const body: IDataObject = {
							merchantAccount,
							shopperReference,
							paymentMethod,
							...additionalOptions,
						};

						responseData = await adyenApiRequest.call(this, 'POST', '/v71/storedPaymentMethods', body);
					}
				}

				// Dispute Operations
				if (resource === 'dispute') {
					const disputePspReference = this.getNodeParameter('disputePspReference', i) as string;

					if (operation === 'accept') {
						const body: IDataObject = {
							disputePspReference,
							merchantAccountCode: merchantAccount,
						};
						responseData = await adyenApiRequest.call(this, 'POST', '/v30/acceptDispute', body, {}, 'disputes');
					}

					if (operation === 'defend') {
						const defenseReasonCode = this.getNodeParameter('defenseReasonCode', i) as string;
						const body: IDataObject = {
							disputePspReference,
							merchantAccountCode: merchantAccount,
							defenseReasonCode,
						};
						responseData = await adyenApiRequest.call(this, 'POST', '/v30/defendDispute', body, {}, 'disputes');
					}

					if (operation === 'getDefenseReasons') {
						const body: IDataObject = {
							disputePspReference,
							merchantAccountCode: merchantAccount,
						};
						responseData = await adyenApiRequest.call(this, 'POST', '/v30/retrieveApplicableDefenseReasons', body, {}, 'disputes');
					}

					if (operation === 'supplyDocument') {
						const content = this.getNodeParameter('content', i) as string;
						const contentType = this.getNodeParameter('contentType', i) as string;
						const defenseDocumentTypeCode = this.getNodeParameter('defenseDocumentTypeCode', i) as string;

						const body: IDataObject = {
							disputePspReference,
							merchantAccountCode: merchantAccount,
							defenseDocuments: [{ content, contentType, defenseDocumentTypeCode }],
						};
						responseData = await adyenApiRequest.call(this, 'POST', '/v30/supplyDefenseDocument', body, {}, 'disputes');
					}

					if (operation === 'deleteDocument') {
						const documentType = this.getNodeParameter('documentType', i) as string;
						const body: IDataObject = {
							disputePspReference,
							merchantAccountCode: merchantAccount,
							defenseDocumentType: documentType,
						};
						responseData = await adyenApiRequest.call(this, 'POST', '/v30/deleteDisputeDefenseDocument', body, {}, 'disputes');
					}
				}

				// Management Operations
				if (resource === 'management') {
					if (operation === 'listCompanies') {
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						responseData = await adyenApiRequest.call(this, 'GET', '/v3/companies', {}, additionalOptions, 'management');
					}

					if (operation === 'getCompany') {
						const companyId = this.getNodeParameter('companyId', i) as string;
						responseData = await adyenApiRequest.call(this, 'GET', `/v3/companies/${companyId}`, {}, {}, 'management');
					}

					if (operation === 'listMerchants') {
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						responseData = await adyenApiRequest.call(this, 'GET', '/v3/merchants', {}, additionalOptions, 'management');
					}

					if (operation === 'getMerchant') {
						const merchantId = this.getNodeParameter('merchantId', i) as string;
						responseData = await adyenApiRequest.call(this, 'GET', `/v3/merchants/${merchantId}`, {}, {}, 'management');
					}

					if (operation === 'listStores') {
						const merchantId = this.getNodeParameter('merchantId', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						responseData = await adyenApiRequest.call(this, 'GET', `/v3/merchants/${merchantId}/stores`, {}, additionalOptions, 'management');
					}

					if (operation === 'createStore') {
						const merchantId = this.getNodeParameter('merchantId', i) as string;
						const reference = this.getNodeParameter('reference', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const shopperStatement = this.getNodeParameter('shopperStatement', i) as string;
						const storeAddress = this.getNodeParameter('storeAddress', i, {}) as IDataObject;

						const body: IDataObject = { reference, description, shopperStatement };
						if (Object.keys(storeAddress).length > 0) {
							body.address = storeAddress;
						}

						responseData = await adyenApiRequest.call(this, 'POST', `/v3/merchants/${merchantId}/stores`, body, {}, 'management');
					}

					if (operation === 'listWebhooks') {
						const merchantId = this.getNodeParameter('merchantId', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						responseData = await adyenApiRequest.call(this, 'GET', `/v3/merchants/${merchantId}/webhooks`, {}, additionalOptions, 'management');
					}

					if (operation === 'createWebhook') {
						const merchantId = this.getNodeParameter('merchantId', i) as string;
						const url = this.getNodeParameter('url', i) as string;
						const type = this.getNodeParameter('type', i) as string;
						const communicationFormat = this.getNodeParameter('communicationFormat', i) as string;
						const active = this.getNodeParameter('active', i) as boolean;

						const body: IDataObject = { url, type, communicationFormat, active };
						responseData = await adyenApiRequest.call(this, 'POST', `/v3/merchants/${merchantId}/webhooks`, body, {}, 'management');
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const err = error as Error;
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: err.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
