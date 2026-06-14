# Stripe Webhook Setup

The store uses Stripe Checkout and synchronizes payment results into the local `Order` table.

## Environment

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_SITE_URL="http://127.0.0.1:4173"
```

## Local Development

1. Start the site with `npm run dev`.
2. Sign in to Stripe CLI.
3. Forward Stripe events:

```powershell
stripe listen --forward-to http://127.0.0.1:4173/api/stripe/webhook
```

4. Put the displayed `whsec_...` value into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart the site.

## Stripe Dashboard

Create a webhook endpoint pointing to:

```text
https://your-domain.example/api/stripe/webhook
```

Enable these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- `payment_intent.succeeded`
- `charge.refunded`

Payment status is read-only in the admin system. Stripe webhook events are the source of truth.
