# Push to GitHub

```bash
# Extract and navigate
unzip n8n-nodes-adyen.zip
cd n8n-nodes-adyen

# Initialize and push
git init
git add .
git commit -m "Initial commit: n8n Adyen enterprise payment processing node

Features:
- Checkout: Sessions, payments, payment methods, card details
- Payment Links: Create, get, update payment links
- Modifications: Capture, cancel, refund, reverse, amount updates
- Recurring: Stored payment methods CRUD operations
- Disputes: Accept, defend, defense documents management
- Management: Companies, merchants, stores, webhooks
- Trigger: Payment, dispute, payout, report notifications
- Multi-environment: Test, Live-EU, Live-US, Live-AU support
- HMAC webhook signature validation"

git remote add origin https://github.com/Velocity-BPA/n8n-nodes-adyen.git
git branch -M main
git push -u origin main
```

## Create GitHub Release

```bash
git tag -a v1.0.0 -m "v1.0.0 - Initial release"
git push origin v1.0.0
```

## Publish to npm

```bash
npm login
npm publish
```
