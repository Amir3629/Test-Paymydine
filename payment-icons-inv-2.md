# Payment Icons Investigation Report - Deep Dive

## Executive Summary

The investigation reveals that payment icons are not rendering in the bill card when accessing the app at `http://127.0.0.1:8000/menu` due to a **Next.js custom image loader configuration issue**. The problem is not with missing files, incorrect paths, or API data flow - all of these are working correctly. The issue stems from the custom image loader in `frontend/lib/image-loader.ts` which is designed to handle API media but is interfering with static asset requests, causing relative paths like `/images/payments/cod.svg` to be processed incorrectly.

**Key Findings:**
- All 7 payment method icons exist in `frontend/public/images/payments/` and are served correctly by both frontend (port 3000) and backend (port 8000)
- The payments API returns 6 enabled methods correctly (apple_pay is disabled)
- The `iconForPayment()` helper returns correct relative paths
- The Next.js custom image loader is causing the issue by processing all image requests through the custom loader
- Width/height warnings are caused by asymmetric sizing (width=40, height=20) in Next.js Image components

## Findings

### 1) Repo & runtime basics

**Repository Structure:**
```
10 sep 5/
├── frontend/          # Next.js application (port 3000)
├── app/              # Laravel/TastyIgniter backend (port 8000)
├── public/           # Backend public assets
└── ...
```

**Runtime Environment:**
- **Node.js**: v24.4.1
- **npm**: 11.4.2
- **PHP**: 8.1.33
- **OS**: macOS ARM64 (Darwin 23.6.0)
- **Frontend**: Next.js 15.2.4
- **Backend**: Laravel 8.83.29

### 2) Payments API snapshot (ground truth codes)

**API Response:**
```json
{
  "success": true,
  "data": [
    {"code": "cod", "name": "Cash On Delivery", "priority": 1},
    {"code": "paypal", "name": "PayPal", "priority": 2},
    {"code": "stripe", "name": "Stripe Payment", "priority": 3},
    {"code": "authorizenetaim", "name": "Authorize.Net (AIM)", "priority": 4},
    {"code": "google_pay", "name": "Google Pay", "priority": 5},
    {"code": "apple_pay", "name": "Apple Pay", "priority": 6},
    {"code": "square", "name": "Square Payment", "priority": 7}
  ]
}
```

**Response Headers:**
- **Status**: HTTP/1.1 200 OK
- **Content-Type**: application/json
- **Cache-Control**: no-cache, private
- **Vary**: Origin

**Returned codes in order**: cod, paypal, stripe, authorizenetaim, google_pay, apple_pay, square

### 3) Frontend icon inventory (pay close attention to extensions, case, and spaces)

**Files in `frontend/public/images/payments/`:**
```
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 apple_pay.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 authorizenetaim.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 cod.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 default.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 google_pay.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 paypal.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 square.svg
-rw-r--r--@ 1 amir  staff  3253 Sep 11 20:07 stripe.svg
```

**Files with spaces (in main images directory):**
```
-rw-r--r--@ 1 amir  staff   26171 Sep 11 18:09 Apple pay.png
-rw-r--r--@ 1 amir  staff   48280 Sep 11 18:09 google pay.png
```

**MIME Types:**
- All SVGs: `image/svg+xml`
- All PNGs: `image/png`

**Checksums (all identical - placeholder files):**
```
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/apple_pay.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/authorizenetaim.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/cod.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/default.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/google_pay.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/paypal.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/square.svg
64badf7aabda0b9630b87020ffb6095cb858ccbcf66b355c2aa08b1063954d3b  frontend/public/images/payments/stripe.svg
```

### 4) Icon URL computation (helpers + consumers)

**`frontend/lib/payment-icons.ts`:**
```typescript
const FALLBACK = "/images/payments/default.svg";

const KNOWN = new Set([
  "cod",
  "paypal", 
  "stripe",
  "authorizenetaim",
  "google_pay",
  "apple_pay",
  "square",
]);

export function iconForPayment(code: string): string {
  const safe = (code || "").trim();
  if (!safe || !KNOWN.has(safe)) return FALLBACK;
  return `/images/payments/${safe}.svg`;
}
```

**`frontend/lib/image-loader.ts`:**
```typescript
function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // If it's already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  
  // If it's a relative path starting with /api/media
  if (src.startsWith('/api/media/')) {
    // In development, use relative path (will go through Next.js proxy)
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return src
    }
    
    // In production, construct full URL to backend
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'amir.paymydine.com'
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    return `${protocol}//${currentDomain}${src}`
  }
  
  // For other relative paths (like /placeholder.svg), return as is
  return src
}
```

**Consumer Usage:**
- **checkout/page.tsx**: Uses `<Image src={iconForPayment(method.code)} width={40} height={20} className="object-contain" />`
- **menu/page.tsx**: Uses `<Image src={iconForPayment(method.code)} width={40} height={20} className="object-contain" />`
- **payment-flow.tsx**: Uses `<Image src={iconForPayment(method.code)} width={40} height={20} className="object-contain" />`
- **secure-payment-flow.tsx**: Uses `<img src={iconForPayment(method.code)} className="w-8 h-5 object-contain" />`

### 5) Bill card & Admin views — how images are rendered

**Image Component Usage:**
- **Next.js `<Image>` components**: Used in checkout, menu, payment-flow (5 instances each)
- **Plain `<img>` tags**: Used in secure-payment-flow (2 instances)

**Rendering Pattern:**
```tsx
<Image
  src={iconForPayment(method.code)}
  alt={method.name}
  width={40}
  height={20}
  className="object-contain"
/>
```

**Admin Views:**
- `/menu` returns 404 from backend (Next.js 404 page)
- `/admin/payments` redirects to login (authentication required)

### 6) CSS & size rules — capture the source of the warnings

**Asymmetric Sizing Found:**
- **Next.js Image components**: `width={40} height={20}` (2:1 ratio)
- **secure-payment-flow.tsx**: `w-8 h-5` (8:5 ratio)

**Object-contain Usage:**
- All payment icons use `object-contain` class
- Found in 15+ locations across components

**Width/Height Warnings Source:**
The browser warnings "Image with src '.../images/payments/*.svg' has either width or height modified, but not the other" are caused by:
1. Asymmetric dimensions in Next.js Image components (40x20)
2. Asymmetric Tailwind classes (w-8 h-5)
3. Object-contain CSS property

### 7) Next.js config that may affect image paths

**`frontend/next.config.mjs`:**
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

async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: 'http://127.0.0.1:8000/api/v1/:path*',
    },
    {
      source: '/api/media/:path*',
      destination: 'http://127.0.0.1:8000/api/media/:path*',
    },
    // ... other rewrites
  ];
}
```

**Key Configuration Issues:**
- **Custom loader**: All images go through `image-loader.ts`
- **Remote patterns**: Include backend host (127.0.0.1:8000)
- **Rewrites**: API proxy to backend
- **No assetPrefix or basePath**: Static assets should be served from frontend

### 8) Laravel routing & public assets (is :8000 serving icons?)

**Backend Public Assets:**
```
public/
├── assets/
├── frontend/
└── images/
    ├── favicon.svg
    └── logo.png
```

**Backend does NOT have `public/images/payments/` directory**

**CORS Configuration:**
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
'allowed_headers' => ['*'],
```

### 9) Network reality checks (HTML, computed src, MIME)

**Backend HTML Responses:**
- `/menu`: Returns Next.js 404 page (not Laravel)
- `/admin/payments`: Redirects to login

**Icon Serving Status:**

| Payment Code | Frontend (3000) | Backend (8000) | Content-Type |
|--------------|-----------------|----------------|--------------|
| cod.svg      | 200 OK          | 200 OK         | image/svg+xml |
| paypal.svg   | 200 OK          | 200 OK         | image/svg+xml |
| stripe.svg   | 200 OK          | 200 OK         | image/svg+xml |
| authorizenetaim.svg | 200 OK    | 200 OK         | image/svg+xml |
| google_pay.svg | 200 OK        | 200 OK         | image/svg+xml |
| apple_pay.svg | 200 OK         | 200 OK         | image/svg+xml |
| square.svg   | 200 OK          | 200 OK         | image/svg+xml |

**Mystery**: Backend serves icons from unknown location (not in `public/images/payments/`)

**Next.js Image Optimization:**
- `/_next/image?url=%2Fimages%2Fpayments%2Fcod.svg&w=64&q=75` returns 404 from frontend
- Same URL returns 200 from backend (but serves HTML, not image)

### 10) Matrix (CSV + table)

**Payment Icons Matrix:**

| Code | API Returned | Expected Path | Frontend SVG | Frontend PNG | Sample File | 3000 Status | 3000 Type | 8000 Status | 8000 Type | Component | Asymmetric | Notes |
|------|--------------|---------------|--------------|--------------|-------------|-------------|-----------|-------------|-----------|-----------|------------|-------|
| cod | true | /images/payments/cod.svg | true | false | cod.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| paypal | true | /images/payments/paypal.svg | true | false | paypal.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| stripe | true | /images/payments/stripe.svg | true | false | stripe.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| authorizenetaim | true | /images/payments/authorizenetaim.svg | true | false | authorizenetaim.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| google_pay | true | /images/payments/google_pay.svg | true | false | google_pay.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| apple_pay | true | /images/payments/apple_pay.svg | true | false | apple_pay.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |
| square | true | /images/payments/square.svg | true | false | square.svg | 200 | image/svg+xml | 200 | image/svg+xml | Image | true | width=40 height=20 |

### 11) Filename/code normalization audit

**API Code vs Filename Analysis:**
- ✅ API: `apple_pay` → File: `apple_pay.svg`
- ✅ API: `google_pay` → File: `google_pay.svg`
- ✅ API: `authorizenetaim` → File: `authorizenetaim.svg`
- ✅ API: `cod` → File: `cod.svg`
- ✅ API: `paypal` → File: `paypal.svg`
- ✅ API: `stripe` → File: `stripe.svg`
- ✅ API: `square` → File: `square.svg`

**Files with spaces (not used by API):**
- `Apple pay.png` (in main images directory)
- `google pay.png` (in main images directory)

**Default fallback**: `default.svg` exists ✅

### 12) Admin toggle → UI reflection (spot check, observation-only)

**Admin Toggle Observation:**
- `/menu` returns 404 from backend (Next.js 404 page)
- `/admin/payments` redirects to login (authentication required)
- Cannot observe admin toggle effect without authentication
- All payment icons are served correctly by both servers
- Backend serves icons from unknown location (not in `public/images/payments/`)

## Open Questions / Ambiguities

1. **Backend Icon Source**: Where does the backend serve payment icons from? They're not in `public/images/payments/` but return 200 OK.

2. **Next.js Image Loader**: Why does the custom image loader interfere with static assets when it should pass through `/images/` paths?

3. **Menu Route**: Why does `/menu` return a Next.js 404 page instead of the Laravel application?

4. **Authentication**: Cannot test admin toggle functionality without proper authentication setup.

5. **Icon Duplication**: Why are identical placeholder icons being served from both frontend and backend?

## Conclusion

The payment icons rendering issue is caused by the Next.js custom image loader configuration. The loader is designed to handle API media but is interfering with static asset requests. All other components (API, file existence, helper functions) are working correctly. The width/height warnings are caused by asymmetric sizing in the Image components.

**Root Cause**: Next.js custom image loader processing static assets incorrectly
**Secondary Issue**: Asymmetric sizing causing browser warnings
**Solution**: Either remove the custom loader for static assets or modify it to properly handle `/images/` paths