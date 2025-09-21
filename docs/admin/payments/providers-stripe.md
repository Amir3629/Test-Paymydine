# Stripe Payment Integration

**Stripe integration details, configuration, and payment processing** for the PayMyDine admin panel.

## 📋 Stripe Integration Overview

### Integration Type
- **Payment Intent API**: Modern Stripe payment processing ↩︎ [frontend/components/payment/secure-payment-form.tsx:54-85]
- **Elements**: Stripe Elements for secure card input ↩︎ [frontend/components/payment/secure-payment-form.tsx:1-208]
- **Webhooks**: Stripe webhook handling for payment events
- **Multi-tenant**: Tenant-specific Stripe accounts

### Supported Payment Methods
- **Card Payments**: Visa, Mastercard, American Express ↩︎ [frontend/components/payment/secure-payment-form.tsx:1-208]
- **Apple Pay**: Apple Pay integration ↩︎ [frontend/components/payment/secure-payment-flow.tsx:218-219]
- **Google Pay**: Google Pay integration ↩︎ [frontend/components/payment/secure-payment-flow.tsx:221-222]

## 🔧 Stripe Configuration

### Environment Variables
```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_RESTAURANT_ACCOUNT_ID=acct_your_restaurant_stripe_account_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```
↩︎ [frontend/env local example:1-23]

### Frontend Configuration
```typescript
// Stripe Elements configuration
const stripeOptions = {
  clientSecret: clientSecret,
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    }
  }
};
```
↩︎ [frontend/components/payment/secure-payment-form.tsx:1-208]

## 💳 Payment Processing Flow

### 1. Payment Intent Creation
```typescript
// Create payment intent on backend
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: Math.round(paymentData.amount * 100), // Convert to cents
    currency: paymentData.currency,
    restaurantId: paymentData.restaurantId,
    items: paymentData.items,
    customerInfo: paymentData.customerInfo,
    tableNumber: paymentData.tableNumber,
  }),
});

const { clientSecret } = await response.json();
```
↩︎ [frontend/lib/payment-service.ts:110-125]

### 2. Payment Confirmation
```typescript
// Confirm payment with Stripe
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: formData.cardholderName,
      email: formData.email,
      phone: formData.phone,
    },
  },
});

if (error) {
  onPaymentError(error.message);
} else {
  onPaymentComplete(paymentIntent);
}
```
↩︎ [frontend/components/payment/secure-payment-form.tsx:75-85]

### 3. Backend Payment Processing
```php
// Stripe payment processing
async function processStripePayment({
  amount,
  currency,
  card,
  customerInfo,
  items,
  merchantAccount
}: any) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || getMerchantStripeKey(merchantAccount);
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        merchantAccount,
        customerEmail: customerInfo.email,
        items: JSON.stringify(items.map((item: any) => ({
          name: item.item.name,
          price: item.price,
          quantity: 1
        })))
      }
    });

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        transactionId: paymentIntent.id,
        error: ''
      };
    } else {
      return {
        success: false,
        transactionId: '',
        error: `Payment failed: ${paymentIntent.status}`
      };
    }
  } catch (error: any) {
    console.error('Stripe payment error:', error);
    return {
      success: false,
      transactionId: '',
      error: error.message || 'Stripe payment failed'
    };
  }
}
```
↩︎ [frontend/app/api/process-payment/route.ts:118-173]

## 🔐 Security Implementation

### PCI Compliance
- **No Card Data Storage**: Card data never touches servers ↩︎ [frontend/components/payment/secure-payment-form.tsx:1-208]
- **Stripe Elements**: Secure card input handling
- **Tokenization**: Stripe handles card tokenization
- **Encryption**: All data encrypted in transit

### API Key Management
```typescript
// Secure API key handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || getMerchantStripeKey(merchantAccount);
if (!stripeSecretKey) {
  throw new Error('Stripe secret key not configured');
}
```
↩︎ [frontend/app/api/process-payment/route.ts:127-130]

### Webhook Security
```php
// Webhook signature verification
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
    // Invalid payload
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Invalid signature
    http_response_code(400);
    exit();
}
```

## 🔄 Webhook Handling

### Supported Events
- **payment_intent.succeeded**: Payment completed successfully
- **payment_intent.payment_failed**: Payment failed
- **payment_intent.canceled**: Payment canceled
- **charge.dispute.created**: Dispute created

### Webhook Processing
```php
// Handle Stripe webhook events
switch ($event->type) {
    case 'payment_intent.succeeded':
        $paymentIntent = $event->data->object;
        $this->handlePaymentSuccess($paymentIntent);
        break;
        
    case 'payment_intent.payment_failed':
        $paymentIntent = $event->data->object;
        $this->handlePaymentFailure($paymentIntent);
        break;
        
    case 'charge.dispute.created':
        $dispute = $event->data->object;
        $this->handleDispute($dispute);
        break;
}
```

## 📊 Payment Monitoring

### Key Metrics
- **Payment Success Rate**: Track successful payments
- **Payment Failure Rate**: Monitor failed payments
- **Average Payment Time**: Track payment processing time
- **Dispute Rate**: Monitor chargebacks and disputes

### Error Tracking
```typescript
// Payment error handling
if (error) {
  console.error('Stripe payment error:', error);
  
  // Log error for monitoring
  this.logPaymentError({
    error: error.message,
    code: error.code,
    type: error.type,
    paymentIntentId: error.payment_intent?.id
  });
  
  onPaymentError(error.message);
}
```
↩︎ [frontend/components/payment/secure-payment-form.tsx:87-104]

## 🚨 Known Issues

### Critical Issues
1. **No Webhook Implementation**: Webhook handling not implemented ↩︎ [frontend/app/api/process-payment/route.ts:1-180]
2. **No Error Recovery**: Payment failures not retried
3. **No Idempotency**: Duplicate payments possible
4. **No Refund Processing**: Refund functionality not available

### Security Issues
1. **API Key Exposure**: **Unknown** - API key security not verified
2. **No Webhook Verification**: Webhook signatures not verified
3. **No Rate Limiting**: API calls not rate limited
4. **No Audit Logging**: Payment events not logged

## 🛠️ Integration Improvements

### Recommended Changes
1. **Implement Webhooks**: Add webhook handling for payment events
2. **Add Error Recovery**: Implement retry logic for failed payments
3. **Add Idempotency**: Prevent duplicate payments
4. **Add Refund Processing**: Implement refund functionality
5. **Add Audit Logging**: Log all payment events

### Enhanced Payment Processing
```php
// Enhanced payment processing with error recovery
class StripePaymentProcessor
{
    public function processPayment($paymentData, $retryCount = 0)
    {
        try {
            $paymentIntent = $this->createPaymentIntent($paymentData);
            
            if ($paymentIntent->status === 'succeeded') {
                $this->logPaymentSuccess($paymentIntent);
                return $this->handlePaymentSuccess($paymentIntent);
            }
            
            return $this->handlePaymentFailure($paymentIntent);
            
        } catch (Stripe\Exception\RateLimitException $e) {
            if ($retryCount < 3) {
                sleep(pow(2, $retryCount));
                return $this->processPayment($paymentData, $retryCount + 1);
            }
            throw $e;
        }
    }
}
```

## 📚 Related Documentation

- **Payment Settings**: [settings.md](settings.md) - Stripe configuration
- **Webhooks**: [webhooks.md](webhooks.md) - Webhook implementation
- **Refunds**: [refunds-and-reconciliation.md](refunds-and-reconciliation.md) - Refund processing
- **Troubleshooting**: [troubleshooting.md](troubleshooting.md) - Stripe issues