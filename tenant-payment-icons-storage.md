# Tenant Payment Icons — Storage Strategy Investigation

**Date**: September 12, 2025  
**Purpose**: Determine whether payment icons should be shared across tenants or tenant-specific, and how similar tenant media is handled

---

## Executive Summary

**Key Finding**: Payment icons are currently **shared static assets** with **no tenant isolation**. The system uses a centralized approach where all tenants share the same payment icons stored in `frontend/public/images/payments/`. This contrasts with the tenant-aware media system used for menus, logos, and other content.

**Recommendation**: **Fix proxy/static serving** rather than implementing tenant-aware DB+storage mapping, as the current architecture clearly indicates payment icons are meant to be shared.

---

## 1) Tenant Media Precedent

### Media Attachments System
The system uses `ti_media_attachments` table for tenant-specific media:

```sql
CREATE TABLE `ti_media_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `disk` varchar(128) NOT NULL,
  `name` varchar(128) NOT NULL,
  `file_name` varchar(128) NOT NULL,
  `mime_type` varchar(128) NOT NULL,
  `size` int unsigned NOT NULL,
  `tag` varchar(128) DEFAULT NULL,
  `attachment_type` varchar(128) DEFAULT NULL,  -- 'menus', 'sliders', etc.
  `attachment_id` bigint unsigned DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `custom_properties` text,
  `priority` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ti_media_attachments_attachment_type_attachment_id_index` (`attachment_type`,`attachment_id`),
  KEY `ti_media_attachments_tag_index` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### How Menu Images Work
Menu images are stored per-tenant in the database and served via API:

```php
// From MenuController.php
LEFT JOIN ti_media_attachments ma ON ma.attachment_type = 'menus' 
    AND ma.attachment_id = m.menu_id 
    AND ma.tag = 'thumb'

// Image URL construction
if ($item->image) {
    $item->image = "/api/media/" . $item->image;  // Proxied through Laravel
} else {
    $item->image = '/images/pasta.png';  // Fallback to static
}
```

### Storage Structure
- **Database**: `ti_media_attachments` stores metadata per tenant
- **Files**: Stored in `storage/app/public/assets/media/attachments/public/{hash1}/{hash2}/{hash3}/{filename}`
- **Serving**: Via `/api/media/` proxy route through Laravel backend

---

## 2) Payment Methods + Icons Link

### Payment Methods Database Schema
```sql
CREATE TABLE `ti_payments` (
  `payment_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `code` varchar(128) NOT NULL,
  `class_name` text NOT NULL,
  `description` text,
  `data` json DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `ti_payments_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Key Findings
- **No icon field**: `ti_payments` table has NO column for storing icon paths or references
- **No media relationship**: No foreign key to `ti_media_attachments` table
- **Static mapping only**: Icons are hardcoded in frontend `iconForPayment()` function
- **Shared across tenants**: All tenants use the same payment method codes and icons

### Current Icon System
```typescript
// frontend/lib/payment-icons.ts
const KNOWN = new Set([
  'cod', 'paypal', 'stripe', 'authorizenetaim', 'google_pay', 'apple_pay', 'square',
]);

export function iconForPayment(code: string): string {
  const key = (code || '').trim();
  return KNOWN.has(key)
    ? `/images/payments/${key}.svg`  // Static path
    : `/images/payments/default.svg`;
}
```

---

## 3) Tenant Branding Assets

### Logo and Branding Storage
- **Invoice logos**: Stored in `setup_settings` table (shared across tenants)
- **Location logos**: Referenced via `ti_media_attachments` (tenant-specific)
- **Theme assets**: Stored in theme directories (shared)

### Storage Directories
```bash
$ ls -la storage/app/public
total 8
drwxr-xr-x@ 3 amir  staff   96 Sep 11 18:09 .
drwxr-xr-x@ 4 amir  staff  128 Sep 11 18:09 ..
-rwxrwxr-x@ 1 amir  staff   14 Sep 11 18:09 .gitignore
```

**Finding**: No tenant-specific subdirectories exist in storage.

---

## 4) Admin Upload Fields

### Payment Method Admin Interface
```php
// app/admin/models/config/payments_model.php
'code' => [
    'label' => 'admin::lang.payments.label_code',
    'type' => 'text',
    'span' => 'left',
],
'name' => [
    'label' => 'admin::lang.payments.label_name', 
    'type' => 'text',
    'span' => 'right',
],
// ... other fields
```

**Finding**: No icon upload fields exist in payment method admin forms.

### Form Field Analysis
```bash
$ grep -r "FormField::make.*icon\|FormField::make.*image" app --include="*.php"
# No results found
```

**Finding**: No admin interface exists for uploading payment icons.

---

## 5) Cashier System Double-Check

### Cashier Icon Investigation
```bash
$ grep -r "cashier.*icon\|cashier.*image" . --include="*.php"
# No results found

$ grep -r "cashier" database --include="*.sql"
# No results found
```

**Finding**: No cashier icon system exists to reference as a precedent.

---

## 6) Current Payment Icon Storage Reality

### Frontend Storage
```bash
$ ls -la frontend/public/images/payments/
total 32
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 cod.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 paypal.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 stripe.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 authorizenetaim.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 google_pay.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 apple_pay.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 square.svg
-rw-r--r--@ 1 amir  staff  1234 Sep 11 18:09 default.svg
```

### Backend Storage
```bash
$ ls -la public/images/payments/
# Directory does not exist
```

**Finding**: Payment icons exist ONLY in frontend, not in backend.

---

## 7) Multi-Tenant Architecture Analysis

### Tenant Identification
- **Subdomain-based**: `{tenant}.paymydine.com`
- **Database switching**: Each tenant has separate database
- **Shared static assets**: All tenants share same frontend assets

### Asset Serving Strategy
1. **Tenant-specific content**: Menus, orders, settings → Database per tenant
2. **Shared static assets**: Payment icons, theme assets → Single frontend instance
3. **Proxied content**: Menu images → Laravel backend serves via `/api/media/`

---

## 8) Conclusion & Recommendations

### Current Architecture Intent
The system is designed with **shared payment icons** across all tenants:
- No database fields for icon storage
- No admin upload interface for icons
- Static mapping in frontend code
- Single set of icons for all tenants

### Recommended Action Path
**Fix proxy/static serving** rather than implementing tenant-aware storage:

1. **Copy icons to backend**: Move payment icons from `frontend/public/images/payments/` to `public/images/payments/`
2. **Fix Next.js image loader**: Ensure proper URL resolution for proxied requests
3. **Update proxy configuration**: Ensure Laravel serves static assets correctly

### Why Not Tenant-Specific Icons?
- No existing precedent for tenant-specific payment branding
- Payment methods are standardized (PayPal, Stripe, etc.)
- Admin interface doesn't support icon uploads
- Database schema doesn't support icon relationships
- Shared static assets align with current architecture

### Implementation Priority
1. **High**: Fix static asset serving (shared approach)
2. **Low**: Consider tenant-specific icons only if business requirements change
3. **N/A**: No need for DB+storage mapping based on current architecture

---

## 9) Technical Evidence Summary

| Aspect | Finding | Evidence |
|--------|---------|----------|
| Payment icon storage | Shared static only | No DB fields, no admin uploads |
| Menu image storage | Tenant-specific DB | `ti_media_attachments` table |
| Cashier icons | Nonexistent | No references found |
| Admin upload fields | None for payments | No `FormField::make.*icon` found |
| Storage structure | Shared frontend assets | Icons only in `frontend/public/` |
| Tenant isolation | Database only | Static assets shared across tenants |

**Final Recommendation**: Implement shared static asset serving fix, not tenant-specific icon system.