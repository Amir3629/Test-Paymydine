# Documentation Style Guide

## 📋 Glossary

| Term | Definition |
|------|------------|
| **Tenant** | A restaurant instance with isolated data and configuration |
| **Order** | A customer's food order with items, payment, and status |
| **QR Code** | Table-specific QR code for customer menu access |
| **Cashier Mode** | Direct ordering interface for restaurant staff |
| **Payment Gateway** | External payment processor (Stripe, PayPal, etc.) |
| **Multi-tenant** | Architecture supporting multiple isolated tenants |
| **TastyIgniter** | Laravel-based restaurant management framework |

## 🎯 Naming Conventions

### Files and Directories
- **kebab-case**: `payment-settings.md`, `checkout-flow.md`
- **Descriptive**: `admin-payments-stripe.md` not `stripe.md`
- **Grouped**: Related files in subdirectories

### Code References
- **File paths**: `app/admin/models/Orders_model.php`
- **Line ranges**: `42-87` for multi-line references
- **Single lines**: `42` for single line references
- **Methods**: `Orders_model::processOrder()`
- **Classes**: `Admin\Controllers\Payments`

### Database References
- **Tables**: `ti_orders`, `ti_menus`
- **Columns**: `order_id`, `menu_name`
- **Indexes**: `idx_orders_status`
- **Foreign Keys**: `fk_orders_customer`

## 📝 Writing Style

### Voice and Tone
- **Active voice**: "The system processes orders" not "Orders are processed"
- **Present tense**: "The API returns data" not "The API will return data"
- **Concise**: Avoid unnecessary words
- **Technical**: Use precise terminology

### Sentence Structure
- **Short sentences**: Easier to scan and understand
- **Bullet points**: For lists and features
- **Numbered lists**: For procedures and steps
- **Tables**: For structured data

### Code Examples
```php
// Good: Complete, runnable example
public function processOrder($orderData) {
    DB::transaction(function() use ($orderData) {
        $order = Order::create($orderData);
        $this->addOrderItems($order, $orderData['items']);
    });
}
```

```php
// Bad: Incomplete or unclear
public function processOrder($data) {
    // Process order
    return $order;
}
```

## 📊 Formatting Standards

### Headers
```markdown
# Main Section (H1) - Only in README files
## Major Section (H2) - Document sections
### Subsection (H3) - Content areas
#### Detail (H4) - Specific points
```

### Code Blocks
- **Language specified**: ```php, ```typescript, ```sql
- **Complete examples**: Include imports and context
- **Commented**: Explain complex logic
- **Formatted**: Proper indentation and spacing

### Tables
- **Headers**: Clear, descriptive column names
- **Alignment**: Left-align text, right-align numbers
- **Consistent**: Same format across similar tables
- **Complete**: All relevant data included

### Lists
- **Bullet points**: For features, items, options
- **Numbered**: For procedures, steps, priorities
- **Nested**: Use consistent indentation
- **Parallel**: Same grammatical structure

## 🔗 Citation Format

### Inline Citations
```
↩︎ [path/to/file.php:lineStart-lineEnd]
```

### Multiple Citations
```
↩︎ [app/admin/models/Orders_model.php:42-87] [frontend/lib/api-client.ts:120-150]
```

### File References
- **PHP files**: `app/admin/controllers/Payments.php`
- **TypeScript files**: `frontend/lib/payment-service.ts`
- **SQL files**: `db/paymydine.sql`
- **Config files**: `config/database.php`

### Line Numbering
- **Single line**: `42`
- **Range**: `42-87`
- **Multiple ranges**: `42-87, 120-150`
- **Entire file**: `1-999` (if file is small)

## 📋 Content Structure

### Document Headers
```markdown
# Document Title

Brief description of what this document covers.

## Overview
High-level summary of the topic.

## Details
Specific information with citations.

## Examples
Code examples and usage patterns.

## Issues
Known problems and limitations.

## References
Links to related documentation.
```

### Section Headers
- **Descriptive**: "Payment Processing Flow" not "Flow"
- **Consistent**: Same level of detail across similar sections
- **Hierarchical**: Logical progression from general to specific

## 🚫 Common Mistakes

### Avoid These
- **Vague language**: "probably", "might", "could be"
- **Missing citations**: Claims without code references
- **Incomplete examples**: Code that won't run
- **Inconsistent formatting**: Different styles in same document
- **Too much detail**: Overwhelming technical depth
- **Too little detail**: Insufficient information

### Do These Instead
- **Specific language**: "The system validates" not "The system might validate"
- **Complete citations**: Every claim supported by code
- **Working examples**: Tested, complete code samples
- **Consistent style**: Same format throughout
- **Appropriate detail**: Right level for the audience
- **Sufficient information**: Complete but not overwhelming

## ✅ Quality Checklist

Before finalizing documentation:

- [ ] All claims have citations
- [ ] Code examples are complete and tested
- [ ] Tables are properly formatted
- [ ] Headers follow hierarchy
- [ ] Links work correctly
- [ ] Language is clear and concise
- [ ] Formatting is consistent
- [ ] File is under 400 lines
- [ ] Summary is included at top