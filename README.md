# n8n-nodes-adyen

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

Enterprise payment processing integration for n8n using the Adyen platform. Process payments, manage disputes, handle recurring billing, and configure webhooks for real-time payment notifications.

![npm version](https://img.shields.io/npm/v/n8n-nodes-adyen)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Checkout API**: Create sessions, process payments, get payment methods, card details
- **Payment Links**: Create, retrieve, and update hosted payment pages
- **Modifications**: Capture, cancel, refund, reverse payments, update amounts
- **Recurring**: Manage stored payment methods (create, list, delete)
- **Disputes**: Accept, defend chargebacks, manage defense documents
- **Management**: Manage companies, merchants, stores, webhooks
- **Webhook Trigger**: Real-time payment notifications with HMAC validation
- **Multi-Environment**: Test, Live-EU, Live-US, Live-AU support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-adyen`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-adyen
```

### Development Installation

```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-adyen.git
cd n8n-nodes-adyen
npm install
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-adyen

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **Environment** | Test, Live (EU), Live (US), or Live (AU) |
| **API Key** | Your API key from Adyen Customer Area |
| **Merchant Account** | Your merchant account name |
| **HMAC Key** | (Optional) For webhook signature validation |
| **Live URL Prefix** | (Live only) Your unique live URL prefix |

### Getting Adyen Credentials

1. Log in to [Adyen Customer Area](https://ca-test.adyen.com)
2. Navigate to **Developers** > **API credentials**
3. Create or select an API credential
4. Copy the **API Key** and note your **Merchant Account**

## Resources & Operations

### Checkout

| Operation | Description |
|-----------|-------------|
| Create Session | Create payment session for Drop-in/Components |
| Get Session | Retrieve session result |
| Get Payment Methods | Get available payment methods |
| Create Payment | Initiate a payment |
| Submit Details | Submit additional payment details |
| Get Card Details | Get card brand from BIN |

### Payment Links

| Operation | Description |
|-----------|-------------|
| Create | Create a payment link |
| Get | Retrieve payment link |
| Update | Update payment link status |

### Modifications

| Operation | Description |
|-----------|-------------|
| Capture | Capture authorized payment |
| Cancel | Cancel authorized payment |
| Refund | Refund captured payment |
| Reverse | Reverse payment (cancel or refund) |
| Update Amount | Update authorized amount |

### Recurring

| Operation | Description |
|-----------|-------------|
| List Stored Methods | Get stored payment methods |
| Create Stored Method | Store payment details |
| Delete Stored Method | Remove stored payment method |

### Disputes

| Operation | Description |
|-----------|-------------|
| Accept | Accept a dispute |
| Defend | Defend a dispute |
| Get Defense Reasons | Get applicable defense reasons |
| Supply Document | Upload defense document |
| Delete Document | Delete defense document |

### Management

| Operation | Description |
|-----------|-------------|
| List/Get Companies | Manage company accounts |
| List/Get Merchants | Manage merchant accounts |
| List/Create Stores | Manage stores |
| List/Create Webhooks | Manage webhook configurations |

## Trigger Node

The **Adyen Trigger** node receives real-time webhook notifications:

### Supported Events

- **Payment**: AUTHORISATION, CAPTURE, CANCELLATION, REFUND
- **Disputes**: CHARGEBACK, NOTIFICATION_OF_CHARGEBACK, REQUEST_FOR_INFORMATION
- **Recurring**: RECURRING_CONTRACT
- **Reports**: REPORT_AVAILABLE

### Webhook Setup

1. Add **Adyen Trigger** node to workflow
2. Select events to listen for
3. Copy the webhook URL
4. In Adyen Customer Area, create webhook with the URL
5. Enable HMAC and copy key to credentials

## Usage Examples

### Create Payment Session

```
Resource: Checkout
Operation: Create Session
Amount: 99.99
Currency: USD
Reference: ORDER-12345
Return URL: https://your-site.com/complete
```

### Capture Payment

```
Resource: Modification
Operation: Capture
PSP Reference: 853587544300290E
Amount: 99.99
Currency: USD
```

## Adyen Concepts

### Amount Handling

Adyen uses minor units (cents). The node automatically converts:
- $10.00 → 1000 (value in cents)

### Environments

| Environment | Use Case |
|-------------|----------|
| Test | Development and testing |
| Live-EU | European production |
| Live-US | US production |
| Live-AU | Australian production |

### API Versions

| API | Version |
|-----|---------|
| Checkout | v71 |
| Management | v3 |
| Disputes | v30 |

## Error Handling

The node provides detailed Adyen error responses:

```json
{
  "status": 422,
  "errorCode": "167",
  "message": "Original pspReference required",
  "errorType": "validation"
}
```

## Security Best Practices

1. **Use HMAC validation** for webhooks
2. **Store credentials securely** in n8n
3. **Use Test environment** for development
4. **Never log sensitive data** (card numbers, CVV)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Support

- **Documentation**: [Adyen API Docs](https://docs.adyen.com/api-explorer/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-adyen/issues)
- **Commercial Support**: licensing@velobpa.com

## Acknowledgments

- [Adyen](https://www.adyen.com/) for their comprehensive payment platform
- [n8n](https://n8n.io/) for the workflow automation framework
