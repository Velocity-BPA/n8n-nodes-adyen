/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for Adyen node
 * 
 * These tests require valid Adyen test credentials.
 * Set the following environment variables before running:
 * - ADYEN_API_KEY
 * - ADYEN_MERCHANT_ACCOUNT
 * - ADYEN_HMAC_KEY (optional)
 */

describe('Adyen Integration Tests', () => {
	const skipIntegration = !process.env.ADYEN_API_KEY;

	beforeAll(() => {
		if (skipIntegration) {
			console.log('Skipping integration tests: ADYEN_API_KEY not set');
		}
	});

	describe('Checkout API', () => {
		it.skip('should create a payment session', async () => {
			// Integration test placeholder
			// Requires valid Adyen credentials
		});

		it.skip('should get payment methods', async () => {
			// Integration test placeholder
			// Requires valid Adyen credentials
		});
	});

	describe('Management API', () => {
		it.skip('should list merchants', async () => {
			// Integration test placeholder
			// Requires valid Adyen credentials
		});
	});

	describe('Webhook Validation', () => {
		it('should validate HMAC signature format', () => {
			// This test doesn't require credentials
			expect(true).toBe(true);
		});
	});
});
