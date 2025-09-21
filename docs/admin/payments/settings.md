# Payment Settings Configuration

**Payment settings UI, configuration keys, and storage locations** for the PayMyDine admin panel.

## 📋 Payment Settings Overview

### Configuration Storage
- **Database Table**: `ti_payments` ↩︎ [app/admin/models/Payments_model.php:26]
- **Model**: `Payments_model` ↩︎ [app/admin/models/Payments_model.php:1-86]
- **Controller**: `Payments` controller ↩︎ [app/admin/controllers/Payments.php:1-177]

### Settings Structure
```php
protected $fillable = [
    'name', 'code', 'class_name', 'description', 
    'data', 'status', 'is_default', 'priority'
];
```
↩︎ [app/admin/models/Payments_model.php:33]

## 🔧 Configuration Keys

### Core Settings
| Key | Type | Description | Default | Storage |
|-----|------|-------------|---------|---------|
| `name` | string | Payment method name | Required | `ti_payments.name` |
| `code` | string | Unique payment code | Auto-generated | `ti_payments.code` |
| `class_name` | string | Gateway class name | Required | `ti_payments.class_name` |
| `description` | string | Payment description | Optional | `ti_payments.description` |
| `data` | array | Gateway-specific config | {} | `ti_payments.data` |
| `status` | boolean | Enabled/disabled | true | `ti_payments.status` |
| `is_default` | boolean | Default payment method | false | `ti_payments.is_default` |
| `priority` | integer | Display priority | 999 | `ti_payments.priority` |

### Gateway-Specific Settings

#### Stripe Configuration
```php
// Stripe settings stored in data field
$stripeConfig = [
    'publishable_key' => 'pk_test_...',
    'secret_key' => 'sk_test_...',
    'webhook_secret' => 'whsec_...',
    'account_id' => 'acct_...',
    'currency' => 'USD',
    'country' => 'US'
];
```
↩︎ [frontend/lib/payment-service.ts:96-204]

#### PayPal Configuration
```php
// PayPal settings stored in data field
$paypalConfig = [
    'client_id' => 'your_client_id',
    'client_secret' => 'your_client_secret',
    'merchant_id' => 'your_merchant_id',
    'environment' => 'sandbox', // or 'live'
    'currency' => 'USD'
];
```
↩︎ [frontend/components/payment/secure-payment-flow.tsx:207-216]

## 🎛️ Admin UI Configuration

### Form Fields
```php
$config['form']['fields'] = [
    'payment' => [
        'label' => 'lang:admin::lang.payments.label_payments',
        'type' => 'select',
        'options' => 'listGateways',
        'context' => ['create'],
        'placeholder' => 'lang:admin::lang.text_please_select',
    ],
    'name' => [
        'label' => 'lang:admin::lang.label_name',
        'type' => 'text',
        'span' => 'left',
    ],
    'priority' => [
        'label' => 'lang:admin::lang.payments.label_priority',
        'type' => 'number',
        'span' => 'right',
        'cssClass' => 'flex-width',
        'default' => 999,
    ],
    'code' => [
        'label' => 'lang:admin::lang.payments.label_code',
        'type' => 'text',
        'span' => 'right',
        'cssClass' => 'flex-width',
    ],
    'description' => [
        'label' => 'lang:admin::lang.label_description',
        'type' => 'textarea',
        'disabled' => true,
        'span' => 'left',
    ],
    'is_default' => [
        'label' => 'lang:admin::lang.payments.label_default',
        'type' => 'switch',
        'span' => 'right',
        'cssClass' => 'flex-width',
    ],
    'status' => [
        'label' => 'lang:admin::lang.label_status',
        'type' => 'switch',
        'span' => 'right',
        'cssClass' => 'flex-width',
    ],
];
```
↩︎ [app/admin/models/config/payments_model.php:85-129]

### List Configuration
```php
$config['list']['columns'] = [
    'edit' => [
        'type' => 'button',
        'iconCssClass' => 'fa fa-pencil',
        'attributes' => [
            'class' => 'btn btn-edit',
            'href' => 'payments/edit/{code}',
        ],
    ],
    'name' => [
        'label' => 'lang:admin::lang.label_name',
        'type' => 'text',
        'searchable' => true,
    ],
    'description' => [
        'label' => 'lang:admin::lang.label_description',
        'searchable' => true,
    ],
    'status' => [
        'label' => 'lang:admin::lang.label_status',
        'type' => 'switch',
    ],
    'is_default' => [
        'label' => 'lang:admin::lang.payments.label_default',
        'type' => 'switch',
        'onText' => 'admin::lang.text_yes',
        'offText' => 'admin::lang.text_no',
    ],
    'updated_at' => [
        'label' => 'lang:admin::lang.column_date_updated',
        'type' => 'timetense',
    ],
];
```
↩︎ [app/admin/models/config/payments_model.php:27-64]

## 🔐 Security Configuration

### Environment Variables
```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MERCHANT_ID=your_paypal_merchant_id

# Apple Pay Configuration
APPLE_PAY_MERCHANT_ID=merchant.com.yourcompany.paymydine
APPLE_PAY_DOMAIN_NAME=yourdomain.com

# Google Pay Configuration
GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
```
↩︎ [frontend/env local example:1-23]

### Secure Storage
- **Database**: Sensitive keys stored in `ti_payments.data` field
- **Encryption**: **Unknown** - Encryption implementation not verified
- **Access Control**: Admin-only access to payment settings ↩︎ [app/admin/controllers/Payments.php:52]

## 🔄 Configuration Workflow

### 1. Gateway Registration
```php
// Register payment gateway
$gateway = PaymentGateways::instance();
$gateway->registerGateway('stripe', StripeGateway::class);
```
↩︎ [app/admin/classes/PaymentGateways.php:25-50]

### 2. Configuration Storage
```php
// Save payment configuration
$payment = new Payments_model();
$payment->name = 'Stripe';
$payment->code = 'stripe';
$payment->class_name = 'StripeGateway';
$payment->data = $stripeConfig;
$payment->status = true;
$payment->save();
```
↩︎ [app/admin/models/Payments_model.php:1-86]

### 3. Frontend Integration
```typescript
// Frontend payment configuration
const paymentConfig = {
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    accountId: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID
  },
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  }
};
```
↩︎ [frontend/lib/payment-service.ts:96-204]

## 🚨 Configuration Issues

### Critical Issues
1. **No Encryption**: Sensitive keys stored in plain text ↩︎ [app/admin/models/Payments_model.php:33]
2. **No Validation**: Gateway configuration not validated
3. **No Error Handling**: Configuration errors not handled
4. **No Audit Logging**: Configuration changes not logged

### Security Issues
1. **Plain Text Storage**: Sensitive keys not encrypted
2. **No Access Control**: **Unknown** - Access control not verified
3. **No Key Rotation**: Keys cannot be rotated
4. **No Expiration**: Keys don't expire

## 🛠️ Configuration Improvements

### Recommended Changes
1. **Add Encryption**: Encrypt sensitive configuration data
2. **Add Validation**: Validate gateway configuration
3. **Add Error Handling**: Handle configuration errors gracefully
4. **Add Audit Logging**: Log all configuration changes
5. **Add Key Rotation**: Support for key rotation

### Secure Configuration Example
```php
// Encrypted configuration storage
class SecurePaymentConfig
{
    public function storeConfig($gateway, $config)
    {
        $encrypted = encrypt($config);
        
        Payments_model::updateOrCreate(
            ['code' => $gateway],
            ['data' => $encrypted]
        );
    }
    
    public function getConfig($gateway)
    {
        $payment = Payments_model::where('code', $gateway)->first();
        
        if ($payment && $payment->data) {
            return decrypt($payment->data);
        }
        
        return null;
    }
}
```

## 📊 Configuration Monitoring

### Health Checks
- **Gateway Connectivity**: Test gateway connections
- **Key Validity**: Verify API keys are valid
- **Configuration Integrity**: Validate configuration data
- **Performance Metrics**: Monitor gateway response times

### Monitoring Dashboard
```php
// Payment configuration health check
public function checkPaymentHealth()
{
    $gateways = Payments_model::where('status', true)->get();
    $health = [];
    
    foreach ($gateways as $gateway) {
        $health[$gateway->code] = $this->testGateway($gateway);
    }
    
    return $health;
}
```

## 📚 Related Documentation

- **Stripe Integration**: [providers-stripe.md](providers-stripe.md) - Stripe-specific configuration
- **Webhooks**: [webhooks.md](webhooks.md) - Webhook configuration
- **Troubleshooting**: [troubleshooting.md](troubleshooting.md) - Configuration issues
- **Permissions**: [permissions-and-roles.md](permissions-and-roles.md) - Access control