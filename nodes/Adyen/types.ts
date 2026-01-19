/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IAdyenAmount {
	value: number;
	currency: string;
}

export interface IAdyenAddress {
	street?: string;
	houseNumberOrName?: string;
	city?: string;
	postalCode?: string;
	stateOrProvince?: string;
	country: string;
}

export interface IAdyenName {
	firstName: string;
	lastName: string;
}

export interface IAdyenPaymentMethod {
	type: string;
	encryptedCardNumber?: string;
	encryptedExpiryMonth?: string;
	encryptedExpiryYear?: string;
	encryptedSecurityCode?: string;
	holderName?: string;
	storedPaymentMethodId?: string;
	iban?: string;
	ownerName?: string;
	[key: string]: unknown;
}

export interface IAdyenLineItem {
	id?: string;
	description?: string;
	amountExcludingTax?: number;
	amountIncludingTax?: number;
	taxAmount?: number;
	taxPercentage?: number;
	quantity?: number;
	taxCategory?: string;
}

export interface IAdyenNotificationRequestItem {
	eventCode: string;
	success: string;
	pspReference: string;
	originalReference?: string;
	merchantAccountCode: string;
	merchantReference?: string;
	amount: IAdyenAmount;
	eventDate: string;
	paymentMethod?: string;
	reason?: string;
	additionalData?: Record<string, string>;
}

export interface IAdyenWebhookNotification {
	live: string;
	notificationItems: Array<{
		NotificationRequestItem: IAdyenNotificationRequestItem;
	}>;
}

export type AdyenEnvironment = 'test' | 'live-eu' | 'live-us' | 'live-au';

export interface IAdyenCredentials {
	environment: AdyenEnvironment;
	apiKey: string;
	merchantAccount: string;
	hmacKey?: string;
	liveUrlPrefix?: string;
}
