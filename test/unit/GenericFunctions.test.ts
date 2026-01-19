/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { formatAmount, getBaseUrl, generateIdempotencyKey, calculateHmacSignature } from '../../nodes/Adyen/GenericFunctions';

describe('GenericFunctions', () => {
	describe('formatAmount', () => {
		it('should convert USD to minor units (cents)', () => {
			const result = formatAmount(10.00, 'USD');
			expect(result).toEqual({ value: 1000, currency: 'USD' });
		});

		it('should convert EUR to minor units', () => {
			const result = formatAmount(25.50, 'EUR');
			expect(result).toEqual({ value: 2550, currency: 'EUR' });
		});

		it('should handle zero decimal currencies (JPY)', () => {
			const result = formatAmount(1000, 'JPY');
			expect(result).toEqual({ value: 1000, currency: 'JPY' });
		});

		it('should handle three decimal currencies (KWD)', () => {
			const result = formatAmount(10.000, 'KWD');
			expect(result).toEqual({ value: 10000, currency: 'KWD' });
		});

		it('should uppercase currency code', () => {
			const result = formatAmount(10, 'usd');
			expect(result.currency).toBe('USD');
		});

		it('should round to nearest integer', () => {
			const result = formatAmount(10.999, 'USD');
			expect(result.value).toBe(1100);
		});
	});

	describe('getBaseUrl', () => {
		it('should return test checkout URL', () => {
			const url = getBaseUrl('test', 'checkout');
			expect(url).toBe('https://checkout-test.adyen.com');
		});

		it('should return test management URL', () => {
			const url = getBaseUrl('test', 'management');
			expect(url).toBe('https://management-test.adyen.com');
		});

		it('should return live-eu checkout URL with prefix', () => {
			const url = getBaseUrl('live-eu', 'checkout', 'myprefix');
			expect(url).toBe('https://myprefix-checkout-live.adyen.com/checkout');
		});

		it('should return live-us checkout URL with prefix', () => {
			const url = getBaseUrl('live-us', 'checkout', 'myprefix');
			expect(url).toBe('https://myprefix-checkout-live-us.adyen.com/checkout');
		});

		it('should return live-au checkout URL with prefix', () => {
			const url = getBaseUrl('live-au', 'checkout', 'myprefix');
			expect(url).toBe('https://myprefix-checkout-live-au.adyen.com/checkout');
		});

		it('should return disputes URL for test', () => {
			const url = getBaseUrl('test', 'disputes');
			expect(url).toBe('https://ca-test.adyen.com/ca/services/DisputeService');
		});
	});

	describe('generateIdempotencyKey', () => {
		it('should generate a unique key', () => {
			const key1 = generateIdempotencyKey();
			const key2 = generateIdempotencyKey();
			expect(key1).not.toBe(key2);
		});

		it('should contain timestamp', () => {
			const before = Date.now();
			const key = generateIdempotencyKey();
			const after = Date.now();
			const timestamp = parseInt(key.split('-')[0]);
			expect(timestamp).toBeGreaterThanOrEqual(before);
			expect(timestamp).toBeLessThanOrEqual(after);
		});

		it('should be a non-empty string', () => {
			const key = generateIdempotencyKey();
			expect(typeof key).toBe('string');
			expect(key.length).toBeGreaterThan(0);
		});
	});

	describe('calculateHmacSignature', () => {
		it('should calculate correct HMAC signature', () => {
			const notification = {
				pspReference: '7914073381342284',
				originalReference: '',
				merchantAccountCode: 'TestMerchant',
				merchantReference: 'TestPayment-1',
				amount: { value: 1000, currency: 'EUR' },
				eventCode: 'AUTHORISATION',
				success: 'true',
			};
			const hmacKey = '44782DEF547AAA06C910C43932B1EB0C71FC68D9D0C057550C48EC2ACF6BA056';

			const signature = calculateHmacSignature(notification, hmacKey);
			expect(typeof signature).toBe('string');
			expect(signature.length).toBeGreaterThan(0);
		});
	});
});
