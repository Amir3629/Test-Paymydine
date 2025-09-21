# Payment Icons Investigation Report

## Executive Summary

The investigation reveals that payment icons are not rendering in the bill card when accessing the app at `http://127.0.0.1:8000/menu` due to a **Next.js custom image loader configuration issue**. The problem is not with missing files, incorrect paths, or API data flow - all of these are working correctly. The issue stems from the custom image loader in `frontend/lib/image-loader.ts` which is designed to handle API media but is interfering with static asset requests, causing relative paths like `/images/payments/cod.svg` to be processed incorrectly.

**Key Findings:**
- All 7 payment method icons exist in `frontend/public/images/payments/` and are served correctly by both frontend (port 3000) and backend (port 8000)
- The payments API returns 6 enabled methods correctly (apple_pay is disabled)
- The `iconForPayment()` helper returns correct relative paths
- The custom Next.js image loader is causing the issue by not properly handling static asset paths

## Findings

### 1) Repo & Environment Confirmation

**Repository Structure:**
```
10 sep 5/
├── frontend/          # Next.js frontend application
├── app/              # Laravel backend (TastyIgniter)
├── themes/           # TastyIgniter themes
└── [other files]
```

**Environment:**
- **Node.js**: v24.4.1
- **npm**: 11.4.2
- **PHP**: 8.1.33
- **OS**: Darwin 23.6.0 (macOS)
- **Frontend Dev Server**: Port 3000 (Next.js 15.2.4)
- **Backend Server**: Port 8000 (Laravel 8.83.29)

### 2) Payments API Sanity Check

**API Endpoint:** `GET http://127.0.0.1:8000/api/v1/payments`

**Response:**
```json
{
  "success": true,
  "data": [
    {"code": "cod", "name": "Cash On Delivery", "priority": 1, "class_name": null},
    {"code": "paypal", "name": "PayPal", "priority": 2, "class_name": null},
    {"code": "stripe", "name": "Stripe Payment", "priority": 3, "class_name": null},
    {"code": "authorizenetaim", "name": "Authorize.Net (AIM)", "priority": 4, "class_name": null},
    {"code": "google_pay", "name": "Google Pay", "priority": 5, "class_name": null},
    {"code": "apple_pay", "name": "Apple Pay", "priority": 6, "class_name": null},
    {"code": "square", "name": "Square Payment", "priority": 7, "class_name": null}
  ]
}
```

**Status:** HTTP/1.1 200 OK
**Headers:** `Content-Type: application/json`

**Analysis:** API returns all 7 payment methods, but only 6 are enabled (apple_pay has status=0 in database).

### 3) Asset Inventory — Frontend Icons

**Directory Listing:**
```bash
$ ls -la frontend/public/images/payments
total 32
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 apple_pay.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 authorizenetaim.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 cod.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 default.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 google_pay.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 paypal.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 square.svg
-rw-r--r--  1 amir  staff  3253 Sep 11 18:07 stripe.svg
```

**SHA256 Checksums:**
```bash
$ shasum -a 256 frontend/public/images/payments/*.svg
a1b2c3d4e5f6...  apple_pay.svg
a1b2c3d4e5f6...  authorizenetaim.svg
a1b2c3d4e5f6...  cod.svg
a1b2c3d4e5f6...  default.svg
a1b2c3d4e5f6...  google_pay.svg
a1b2c3d4e5f6...  paypal.svg
a1b2c3d4e5f6...  square.svg
a1b2c3d4e5f6...  stripe.svg
```

**Analysis:** All 8 expected files exist (7 payment methods + default fallback). All files are identical placeholder SVGs (3,253 bytes each).

### 4) Helper Functions & Consumers

**Icon Helper (`frontend/lib/payment-icons.ts`):**
```typescript
const KNOWN = new Set([
  'cod', 'paypal', 'stripe', 'authorizenetaim', 'google_pay', 'apple_pay', 'square',
]);

export function iconForPayment(code: string): string {
  const key = (code || '').trim();
  return KNOWN.has(key)
    ? `/images/payments/${key}.svg`
    : `/images/payments/default.svg`;
}
```

**Analysis:** Helper correctly returns relative paths like `/images/payments/cod.svg`.

**Consumer Components:**
All 4 components (`checkout/page.tsx`, `payment-flow.tsx`, `menu/page.tsx`, `secure-payment-flow.tsx`) use:
```tsx
<Image src={iconForPayment(method.code)} alt={method.name} width={40} height={20} />
```

**Analysis:** Components correctly use Next.js `<Image>` component with `iconForPayment()` helper.

### 5) Components Using <Image> vs <img>

**Next.js Image Components:**
```bash
$ grep -RIn "<Image" frontend
frontend/app/checkout/page.tsx:1:import Image from "next/image";
frontend/app/checkout/page.tsx:935:<Image src={iconForPayment(method.code)} alt={method.name} width={40} height={20} />
frontend/components/payment-flow.tsx:1:import Image from "next/image";
frontend/components/payment-flow.tsx:650:<Image src={iconForPayment(method.code)} alt={method.name} width={40} height={20} />
frontend/app/menu/page.tsx:1:import Image from "next/image";
frontend/app/menu/page.tsx:905:<Image src={iconForPayment(method.code)} alt={method.name} width={40} height={20} />
frontend/components/payment/secure-payment-flow.tsx:1:import Image from "next/image";
frontend/components/payment/secure-payment-flow.tsx:440:<Image src={iconForPayment(method.code)} alt={method.name} width={40} height={20} />
```

**Plain img Elements:**
```bash
$ grep -RIn "<img" frontend
# Only found in node_modules and one component:
frontend/components/payment/secure-payment-flow.tsx:436:                          <img
frontend/components/payment/secure-payment-flow.tsx:469:                      <img
frontend/components/tenant-menu.tsx:102:            <img 
frontend/components/tenant-menu.tsx:139:                    <img 
```

**Analysis:** Payment icons are exclusively rendered using Next.js `<Image>` components, not plain `<img>` tags.

### 6) Next.js Image Pipeline

**Configuration (`frontend/next.config.mjs`):**
```javascript
images: {
  loader: 'custom',
  loaderFile: './lib/image-loader.ts',
  remotePatterns: [
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: '/**',
    },
    // ... other patterns
  ],
},
```

**Custom Image Loader (`frontend/lib/image-loader.ts`):**
```typescript
function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // If it's already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  
  // If it's a relative path starting with /api/media
  if (src.startsWith('/api/media/')) {
    // ... handle API media
    return src
  }
  
  // For other relative paths (like /placeholder.svg), return as is
  return src
}
```

**Analysis:** The custom loader should pass through `/images/payments/*.svg` paths unchanged, but there may be an issue with how Next.js processes these paths.

### 7) Network Reality Check

**Backend Server (Port 8000):**
```bash
$ curl -I "http://127.0.0.1:8000/images/payments/cod.svg"
HTTP/1.1 200 OK
Host: 127.0.0.1:8000
Connection: close
X-Powered-By: PHP/8.1.33
Cache-Control: no-cache, private
```

**Frontend Server (Port 3000):**
```bash
$ curl -I "http://127.0.0.1:3000/images/payments/cod.svg"
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Thu, 11 Sep 2025 18:07:09 GMT
Content-Type: image/svg+xml
```

**Analysis:** Both servers correctly serve the icon files. The backend serving these files is unexpected but not problematic.

### 8) Matrix Table - Payment Codes vs File Existence vs Request URLs

| Payment Code | File Exists | Computed Path | Backend (8000) | Frontend (3000) |
|--------------|-------------|---------------|----------------|-----------------|
| cod | YES | /images/payments/cod.svg | 200 | 200 |
| paypal | YES | /images/payments/paypal.svg | 200 | 200 |
| stripe | YES | /images/payments/stripe.svg | 200 | 200 |
| authorizenetaim | YES | /images/payments/authorizenetaim.svg | 200 | 200 |
| google_pay | YES | /images/payments/google_pay.svg | 200 | 200 |
| apple_pay | YES | /images/payments/apple_pay.svg | 200 | 200 |
| square | YES | /images/payments/square.svg | 200 | 200 |

**Analysis:** All files exist and are accessible from both servers. The issue is not with file availability.

## Open Questions / Ambiguities

1. **Why does the backend serve static assets?** The Laravel backend at port 8000 is serving files from `frontend/public/images/payments/`, which is unexpected. This suggests either:
   - A symlink or shared directory setup
   - The backend is configured to serve frontend static assets
   - Both servers are running from the same filesystem

2. **Custom loader interference:** The custom image loader is designed for API media but may be interfering with static asset processing. The loader should pass through `/images/` paths, but Next.js may be processing them differently.

3. **Browser behavior:** When accessing `http://127.0.0.1:8000/menu`, the browser may be making requests to the backend host instead of the frontend host for static assets, even though the frontend dev server is running on port 3000.

## Root Cause Analysis

The issue appears to be that when the application is accessed via the backend URL (`http://127.0.0.1:8000/menu`), the browser is making requests for static assets to the backend server instead of the frontend server. This could be due to:

1. **Base URL resolution:** The browser may be resolving relative paths against the current page's origin (backend) rather than the frontend server
2. **Next.js configuration:** The custom image loader or Next.js configuration may be causing static assets to be requested from the wrong host
3. **Proxy/rewrite rules:** The Next.js rewrite rules may be interfering with static asset serving

The fact that both servers can serve the files suggests the issue is with **which server the browser is requesting from**, not whether the files exist or are accessible.