# Payment Webhooks

**Webhook endpoints, signature verification, and event handling** for payment processing.

## 📋 Webhook Overview

### Current Status
**Status**: **Critical Issue** - Webhook handling not implemented ↩︎ [frontend/app/api/process-payment/route.ts:1-180]

**Risk**: Payment events not processed, order status not updated

**Recommendation**: Implement webhook handling immediately

### Required Webhooks
- **Stripe Webhooks**: Payment events from Stripe
- **PayPal Webhooks**: Payment events from PayPal
- **Apple Pay Webhooks**: Payment events from Apple Pay
- **Google Pay Webhooks**: Payment events from Google Pay

## 🔧 Webhook Implementation

### Stripe Webhook Endpoint
```php
// Stripe webhook endpoint
Route::post('/webhooks/stripe', function (Request $request) {
    $payload = $request->getContent();
    $sig_header = $request->header('Stripe-Signature');
    $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
    
    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload, $sig_header, $endpoint_secret
        );
    } catch(\UnexpectedValueException $e) {
        // Invalid payload
        return response()->json(['error' => 'Invalid payload'], 400);
    } catch(\Stripe\Exception\SignatureVerificationException $e) {
        // Invalid signature
        return response()->json(['error' => 'Invalid signature'], 400);
    }
    
    // Process webhook event
    return $this->handleStripeWebhook($event);
});
```

### PayPal Webhook Endpoint
```php
// PayPal webhook endpoint
Route::post('/webhooks/paypal', function (Request $request) {
    $payload = $request->getContent();
    $headers = $request->headers->all();
    
    // Verify PayPal webhook signature
    if (!$this->verifyPayPalWebhook($payload, $headers)) {
        return response()->json(['error' => 'Invalid signature'], 400);
    }
    
    $event = json_decode($payload, true);
    return $this->handlePayPalWebhook($event);
});
```

## 🔐 Signature Verification

### Stripe Signature Verification
```php
// Stripe webhook signature verification
public function verifyStripeWebhook($payload, $sig_header, $endpoint_secret)
{
    $timestamp = null;
    $signature = null;
    
    // Parse signature header
    $elements = explode(',', $sig_header);
    foreach ($elements as $element) {
        $parts = explode('=', $element, 2);
        if ($parts[0] === 't') {
            $timestamp = $parts[1];
        } elseif ($parts[0] === 'v1') {
            $signature = $parts[1];
        }
    }
    
    if (!$timestamp || !$signature) {
        return false;
    }
    
    // Check timestamp (prevent replay attacks)
    if (time() - $timestamp > 300) { // 5 minutes
        return false;
    }
    
    // Verify signature
    $signed_payload = $timestamp . '.' . $payload;
    $expected_signature = hash_hmac('sha256', $signed_payload, $endpoint_secret);
    
    return hash_equals($signature, $expected_signature);
}
```

### PayPal Signature Verification
```php
// PayPal webhook signature verification
public function verifyPayPalWebhook($payload, $headers)
{
    $cert_id = $headers['paypal-cert-id'][0] ?? null;
    $signature = $headers['paypal-transmission-sig'][0] ?? null;
    $timestamp = $headers['paypal-transmission-time'][0] ?? null;
    
    if (!$cert_id || !$signature || !$timestamp) {
        return false;
    }
    
    // Verify timestamp (prevent replay attacks)
    if (time() - strtotime($timestamp) > 300) { // 5 minutes
        return false;
    }
    
    // Get PayPal certificate
    $cert = $this->getPayPalCertificate($cert_id);
    if (!$cert) {
        return false;
    }
    
    // Verify signature
    $data = $timestamp . $cert_id . $payload;
    $signature_data = base64_decode($signature);
    
    return openssl_verify($data, $signature_data, $cert, OPENSSL_ALGO_SHA256) === 1;
}
```

## 📨 Event Processing

### Stripe Event Handling
```php
// Handle Stripe webhook events
public function handleStripeWebhook($event)
{
    switch ($event->type) {
        case 'payment_intent.succeeded':
            $this->handlePaymentSuccess($event->data->object);
            break;
            
        case 'payment_intent.payment_failed':
            $this->handlePaymentFailure($event->data->object);
            break;
            
        case 'payment_intent.canceled':
            $this->handlePaymentCanceled($event->data->object);
            break;
            
        case 'charge.dispute.created':
            $this->handleDisputeCreated($event->data->object);
            break;
            
        case 'invoice.payment_succeeded':
            $this->handleInvoicePaymentSuccess($event->data->object);
            break;
            
        case 'invoice.payment_failed':
            $this->handleInvoicePaymentFailure($event->data->object);
            break;
            
        default:
            Log::info('Unhandled Stripe webhook event', [
                'type' => $event->type,
                'id' => $event->id
            ]);
    }
    
    return response()->json(['status' => 'success']);
}
```

### PayPal Event Handling
```php
// Handle PayPal webhook events
public function handlePayPalWebhook($event)
{
    switch ($event['event_type']) {
        case 'PAYMENT.CAPTURE.COMPLETED':
            $this->handlePaymentCaptureCompleted($event['resource']);
            break;
            
        case 'PAYMENT.CAPTURE.DENIED':
            $this->handlePaymentCaptureDenied($event['resource']);
            break;
            
        case 'PAYMENT.CAPTURE.REFUNDED':
            $this->handlePaymentRefunded($event['resource']);
            break;
            
        case 'PAYMENT.CAPTURE.REVERSED':
            $this->handlePaymentReversed($event['resource']);
            break;
            
        default:
            Log::info('Unhandled PayPal webhook event', [
                'type' => $event['event_type'],
                'id' => $event['id']
            ]);
    }
    
    return response()->json(['status' => 'success']);
}
```

## 🔄 Order Status Updates

### Payment Success Handling
```php
// Handle successful payment
public function handlePaymentSuccess($paymentIntent)
{
    $orderId = $paymentIntent->metadata->order_id ?? null;
    
    if (!$orderId) {
        Log::error('Payment success without order ID', [
            'payment_intent_id' => $paymentIntent->id
        ]);
        return;
    }
    
    // Update order status
    $order = Order::find($orderId);
    if ($order) {
        $order->update([
            'status_id' => $this->getStatusId('confirmed'),
            'payment_status' => 'paid',
            'payment_intent_id' => $paymentIntent->id,
            'paid_at' => now()
        ]);
        
        // Log status change
        $this->logStatusChange($order, 'confirmed', 'Payment successful');
        
        // Send confirmation email
        $this->sendOrderConfirmation($order);
    }
}
```

### Payment Failure Handling
```php
// Handle failed payment
public function handlePaymentFailure($paymentIntent)
{
    $orderId = $paymentIntent->metadata->order_id ?? null;
    
    if (!$orderId) {
        Log::error('Payment failure without order ID', [
            'payment_intent_id' => $paymentIntent->id
        ]);
        return;
    }
    
    // Update order status
    $order = Order::find($orderId);
    if ($order) {
        $order->update([
            'status_id' => $this->getStatusId('cancelled'),
            'payment_status' => 'failed',
            'payment_intent_id' => $paymentIntent->id,
            'cancelled_at' => now()
        ]);
        
        // Log status change
        $this->logStatusChange($order, 'cancelled', 'Payment failed');
        
        // Send failure notification
        $this->sendPaymentFailureNotification($order);
    }
}
```

## 🚨 Error Handling

### Webhook Error Handling
```php
// Webhook error handling
public function handleWebhookError($exception, $event = null)
{
    Log::error('Webhook processing error', [
        'error' => $exception->getMessage(),
        'event_type' => $event->type ?? 'unknown',
        'event_id' => $event->id ?? 'unknown',
        'trace' => $exception->getTraceAsString()
    ]);
    
    // Send alert to administrators
    $this->sendWebhookErrorAlert($exception, $event);
    
    // Return 500 to trigger retry
    return response()->json(['error' => 'Internal server error'], 500);
}
```

### Retry Logic
```php
// Webhook retry logic
public function handleWebhookWithRetry($event, $maxRetries = 3)
{
    $retryCount = 0;
    
    while ($retryCount < $maxRetries) {
        try {
            return $this->processWebhookEvent($event);
        } catch (Exception $e) {
            $retryCount++;
            
            if ($retryCount >= $maxRetries) {
                throw $e;
            }
            
            // Exponential backoff
            sleep(pow(2, $retryCount));
        }
    }
}
```

## 📊 Webhook Monitoring

### Health Checks
```php
// Webhook health check
public function checkWebhookHealth()
{
    $health = [
        'stripe' => $this->checkStripeWebhookHealth(),
        'paypal' => $this->checkPayPalWebhookHealth(),
        'apple_pay' => $this->checkApplePayWebhookHealth(),
        'google_pay' => $this->checkGooglePayWebhookHealth()
    ];
    
    return $health;
}
```

### Event Logging
```php
// Log webhook events
public function logWebhookEvent($provider, $eventType, $eventId, $status, $data = [])
{
    WebhookLog::create([
        'provider' => $provider,
        'event_type' => $eventType,
        'event_id' => $eventId,
        'status' => $status,
        'data' => $data,
        'processed_at' => now()
    ]);
}
```

## 🧪 Testing Webhooks

### Webhook Testing
```php
// Test webhook endpoint
public function testStripeWebhook()
{
    $payload = json_encode([
        'id' => 'evt_test_webhook',
        'object' => 'event',
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => [
                'id' => 'pi_test_123',
                'status' => 'succeeded',
                'metadata' => [
                    'order_id' => '123'
                ]
            ]
        ]
    ]);
    
    $response = $this->postJson('/webhooks/stripe', [], [
        'Stripe-Signature' => $this->generateStripeSignature($payload)
    ]);
    
    $response->assertStatus(200);
}
```

## 📚 Related Documentation

- **Stripe Integration**: [providers-stripe.md](providers-stripe.md) - Stripe webhook details
- **Payment Settings**: [settings.md](settings.md) - Webhook configuration
- **Troubleshooting**: [troubleshooting.md](troubleshooting.md) - Webhook issues
- **Refunds**: [refunds-and-reconciliation.md](refunds-and-reconciliation.md) - Refund webhooks