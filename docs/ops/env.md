# Environment Variables Reference

**Complete environment variables** for both backend and frontend with descriptions and safe example values.

## 📋 Backend Environment Variables

### Application Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `APP_NAME` | Yes | "PaymyDine" | Application name | `config/app.php:17` |
| `APP_ENV` | Yes | production | Environment (local/production) | `config/app.php:18` |
| `APP_KEY` | Yes | - | Laravel encryption key | `config/app.php:19` |
| `APP_DEBUG` | Yes | false | Debug mode | `config/app.php:20` |
| `APP_URL` | Yes | http://127.0.0.1:8000 | Application URL | `config/app.php:21` |
| `IGNITER_LOCATION_MODE` | Yes | multiple | Location mode | `config/app.php:22` |

### Database Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `DB_CONNECTION` | Yes | mysql | Database driver | `config/database.php:15` |
| `DB_HOST` | Yes | 127.0.0.1 | Database host | `config/database.php:32` |
| `DB_PORT` | Yes | 3306 | Database port | `config/database.php:33` |
| `DB_DATABASE` | Yes | paymydine | Database name | `config/database.php:34` |
| `DB_USERNAME` | Yes | root | Database username | `config/database.php:35` |
| `DB_PASSWORD` | Yes | - | Database password | `config/database.php:36` |
| `DB_PREFIX` | Yes | ti_ | Database table prefix | `config/database.php:37` |

### Cache Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `BROADCAST_DRIVER` | No | log | Broadcast driver | `config/app.php:23` |
| `CACHE_DRIVER` | No | file | Cache driver | `config/app.php:24` |
| `QUEUE_CONNECTION` | No | sync | Queue connection | `config/app.php:25` |
| `SESSION_DRIVER` | No | file | Session driver | `config/app.php:26` |
| `SESSION_LIFETIME` | No | 120 | Session lifetime (minutes) | `config/app.php:27` |

### Redis Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `REDIS_HOST` | No | 127.0.0.1 | Redis host | `config/database.php:38` |
| `REDIS_PASSWORD` | No | null | Redis password | `config/database.php:39` |
| `REDIS_PORT` | No | 6379 | Redis port | `config/database.php:40` |

### Mail Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `MAIL_MAILER` | No | log | Mail driver | `config/mail.php:15` |
| `MAIL_HOST` | No | null | Mail host | `config/mail.php:16` |
| `MAIL_PORT` | No | null | Mail port | `config/mail.php:17` |
| `MAIL_USERNAME` | No | null | Mail username | `config/mail.php:18` |
| `MAIL_PASSWORD` | No | null | Mail password | `config/mail.php:19` |
| `MAIL_ENCRYPTION` | No | null | Mail encryption | `config/mail.php:20` |
| `MAIL_FROM_ADDRESS` | No | noreply@tastyigniter.tld | From email | `config/mail.php:21` |
| `MAIL_FROM_NAME` | No | "${APP_NAME}" | From name | `config/mail.php:22` |

## 📋 Frontend Environment Variables

### Application Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | http://localhost:8001 | API base URL | `frontend/lib/environment-config.ts:40-50` |
| `NEXT_PUBLIC_FRONTEND_URL` | Yes | http://localhost:3001 | Frontend URL | `frontend/lib/environment-config.ts:40-50` |
| `NEXT_PUBLIC_WS_URL` | No | ws://localhost:8080 | WebSocket URL | `frontend/lib/environment-config.ts:40-50` |
| `NODE_ENV` | Yes | development | Node environment | `frontend/package.json:1-85` |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | development | Environment type | `frontend/lib/environment-config.ts:40-50` |

### Tenant Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `NEXT_PUBLIC_TENANT_DETECTION` | Yes | true | Enable tenant detection | `frontend/lib/environment-config.ts:40-50` |
| `NEXT_PUBLIC_DEFAULT_TENANT` | Yes | paymydine | Default tenant | `frontend/lib/environment-config.ts:40-50` |

### Debug Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `NEXT_PUBLIC_DEV_MODE` | No | true | Development mode | `frontend/env local example:13` |
| `NEXT_PUBLIC_DEBUG_MODE` | No | true | Debug mode | `frontend/env local example:14` |
| `NEXT_PUBLIC_LOG_LEVEL` | No | debug | Log level | `frontend/env local example:15` |

### Feature Flags
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `NEXT_PUBLIC_ENABLE_PAYMENTS` | No | true | Enable payments | `frontend/env local example:18` |
| `NEXT_PUBLIC_ENABLE_WAITER_CALLS` | No | true | Enable waiter calls | `frontend/env local example:19` |
| `NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES` | No | true | Enable real-time updates | `frontend/env local example:20` |
| `NEXT_PUBLIC_ENABLE_QR_CODES` | No | true | Enable QR codes | `frontend/env local example:21` |
| `NEXT_PUBLIC_ENABLE_SPLIT_BILL` | No | true | Enable split bill | `frontend/env local example:22` |
| `NEXT_PUBLIC_ENABLE_TIPS` | No | true | Enable tips | `frontend/env local example:23` |

### Payment Configuration
| Key | Required | Default | Description | Reads/Writes |
|-----|----------|---------|-------------|--------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | - | Stripe publishable key | `frontend/components/payment/secure-payment-form.tsx:1-208` |
| `STRIPE_SECRET_KEY` | Yes | - | Stripe secret key | `frontend/app/api/process-payment/route.ts:127-130` |
| `STRIPE_RESTAURANT_ACCOUNT_ID` | No | - | Stripe restaurant account ID | `frontend/lib/payment-service.ts:96-204` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | No | - | PayPal client ID | `frontend/components/payment/secure-payment-flow.tsx:207-216` |
| `PAYPAL_CLIENT_SECRET` | No | - | PayPal client secret | `frontend/lib/payment-service.ts:171-204` |
| `PAYPAL_MERCHANT_ID` | No | - | PayPal merchant ID | `frontend/lib/payment-service.ts:171-204` |
| `APPLE_PAY_MERCHANT_ID` | No | - | Apple Pay merchant ID | `frontend/components/payment/secure-payment-flow.tsx:218-219` |
| `APPLE_PAY_DOMAIN_NAME` | No | - | Apple Pay domain name | `frontend/components/payment/secure-payment-flow.tsx:218-219` |
| `NEXT_PUBLIC_STRIPE_ACCOUNT_ID` | No | - | Stripe account ID for Google Pay | `frontend/components/payment/secure-payment-flow.tsx:221-222` |

## 🔧 Environment Setup

### Development Environment
```bash
# Backend (.env)
APP_NAME="PayMyDine"
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
IGNITER_LOCATION_MODE=multiple

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymydine
DB_USERNAME=root
DB_PASSWORD=your_password
DB_PREFIX=ti_

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

NEXT_PUBLIC_TENANT_DETECTION=true
NEXT_PUBLIC_DEFAULT_TENANT=paymydine

NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug

NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_WAITER_CALLS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=true
NEXT_PUBLIC_ENABLE_QR_CODES=true
NEXT_PUBLIC_ENABLE_SPLIT_BILL=true
NEXT_PUBLIC_ENABLE_TIPS=true
```

### Production Environment
```bash
# Backend (.env)
APP_NAME="PayMyDine"
APP_ENV=production
APP_KEY=base64:your_production_app_key
APP_DEBUG=false
APP_URL=https://yourdomain.com
IGNITER_LOCATION_MODE=multiple

DB_CONNECTION=mysql
DB_HOST=your_production_db_host
DB_PORT=3306
DB_DATABASE=paymydine
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_PREFIX=ti_

# Frontend (.env.production)
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

NEXT_PUBLIC_TENANT_DETECTION=true
NEXT_PUBLIC_DEFAULT_TENANT=paymydine

NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error

NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_WAITER_CALLS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=true
NEXT_PUBLIC_ENABLE_QR_CODES=true
NEXT_PUBLIC_ENABLE_SPLIT_BILL=true
NEXT_PUBLIC_ENABLE_TIPS=true
```

## 🔒 Security Considerations

### Sensitive Variables
- **Database Credentials**: `DB_USERNAME`, `DB_PASSWORD`
- **API Keys**: `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`
- **Encryption Keys**: `APP_KEY`
- **Webhook Secrets**: `STRIPE_WEBHOOK_SECRET`

### Security Best Practices
1. **Never commit sensitive variables** to version control
2. **Use environment-specific files** (.env.local, .env.production)
3. **Rotate keys regularly** for production environments
4. **Use strong passwords** for database credentials
5. **Enable encryption** for sensitive data

## 🚨 Common Issues

### Missing Variables
1. **APP_KEY not set**: Generate with `php artisan key:generate`
2. **Database connection failed**: Check `DB_*` variables
3. **Payment processing failed**: Check payment API keys
4. **Tenant detection failed**: Check `NEXT_PUBLIC_TENANT_DETECTION`

### Environment Mismatches
1. **Frontend/Backend URL mismatch**: Ensure URLs match
2. **Database connection issues**: Check host and credentials
3. **Payment API errors**: Verify API keys are correct
4. **Tenant routing issues**: Check tenant detection settings

## 📚 Related Documentation

- **Setup**: [setup.md](setup.md) - Local development setup
- **Deployment**: [deployment.md](deployment.md) - Production deployment
- **Observability**: [observability.md](observability.md) - Logging and monitoring