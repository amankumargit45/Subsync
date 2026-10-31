# SubFlow - Unified Subscription & Recurring Billing Platform

> **Odoo × Flux Hackathon MVP** built for Brightloop Software.  
> Production-quality, modular monolith backend powering end-to-end subscription lifecycle, automated recurring billing, payments, and revenue analytics.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ 
- **MongoDB** v6+ (or MongoDB Atlas connection string)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (or use the pre-configured Atlas connection):
```bash
cp .env.example .env
```

Environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.dl09cop.mongodb.net/subflow?retryWrites=true&w=majority
JWT_SECRET=subflow_hackathon_jwt_secret_brightloop_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@subflow.app
```

### 4. Seed the Database
Populate test accounts (Admin, Staff, Customers), products, tiered plans, discounts, taxes, quotations, active subscriptions, overdue invoices, and payments:
```bash
npm run seed
```

### 5. Run the Server
```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```
- API Base URL: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

### 6. Run Test Suite
```bash
npm test
```
All 5 test suites (24 tests) validate authentication, RBAC, discount/tax pricing engine, subscription lifecycle rules, invoice idempotency, and payment balances.

---

## 🔑 Test Credentials (Seed Data)

| Role | Email | Password | Scope / Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@subflow.app` | `Admin@12345` | Full system access (Products, Plans, Taxes, Discounts, Analytics) |
| **STAFF** | `staff@subflow.app` | `Staff@12345` | Day-to-day operations (Customers, Quotations, Subscriptions, Payments) |
| **CUSTOMER** | `acme@example.com` | `Customer@12345` | Acme Innovations Ltd (Own profile, subscriptions, invoices, payments) |
| **CUSTOMER** | `nexus@example.com` | `Customer@12345` | Nexus Cloud Systems (Own records only) |
| **CUSTOMER** | `zenith@example.com` | `Customer@12345` | Zenith Enterprise Labs (Own records only) |

---

## 📁 Backend Architecture & Directory Structure

```
server/
├── src/
│   ├── config/
│   │   ├── constants.js          # System enums, roles, statuses, lifecycle transitions
│   │   ├── db.js                 # Mongoose connection handler
│   │   └── env.js                # Environment configuration & validation
│   ├── models/
│   │   ├── Customer.js           # Customer profile, billing address, taxId
│   │   ├── Discount.js           # Percentage & fixed amount discounts with eligibility rules
│   │   ├── Invoice.js            # Immutable historical snapshot with compound unique index
│   │   ├── Payment.js            # Transactional payment record (UPI, CARD, etc.)
│   │   ├── Plan.js               # Billing frequency, pricing, lifecycle rules
│   │   ├── Product.js            # Product catalog with variants & price adjustments
│   │   ├── Quotation.js          # Quotation draft/confirmed with line-item calculations
│   │   ├── Subscription.js       # Subscription lifecycle, next billing date & frequency
│   │   ├── Tax.js                # Inclusive/Exclusive tax rates (e.g. GST 18%)
│   │   └── User.js               # Authentication, passwordHash, RBAC role
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── dashboardController.js
│   │   ├── discountController.js
│   │   ├── invoiceController.js
│   │   ├── paymentController.js
│   │   ├── planController.js
│   │   ├── productController.js
│   │   ├── quotationController.js
│   │   ├── subscriptionController.js
│   │   └── taxController.js
│   ├── services/
│   │   ├── analyticsService.js   # MongoDB aggregation pipelines for dashboard metrics
│   │   ├── authService.js        # Registration, login, password reset
│   │   ├── billingService.js     # Recurring billing scheduler & period advancement
│   │   ├── discountService.js    # Multi-rule discount validation & deduction
│   │   ├── emailService.js       # Nodemailer notifications (graceful dev fallback)
│   │   ├── invoiceService.js     # Idempotent invoice generation & DB snapshots
│   │   ├── paymentService.js     # Atomic payment processing & balance reconciliation
│   │   ├── pricingService.js     # Unified pricing engine (Subtotal → Discount → Tax → Total)
│   │   ├── quotationService.js   # Quotation creation & subscription conversion
│   │   ├── subscriptionService.js# State machine transitions & billing intervals
│   │   └── taxService.js         # Dynamic tax calculations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── discountRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── planRoutes.js
│   │   ├── productRoutes.js
│   │   ├── quotationRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   └── taxRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   ├── errorMiddleware.js    # Centralized error handler with safe production messages
│   │   ├── rateLimitMiddleware.js# Express rate limiting for auth & general endpoints
│   │   ├── roleMiddleware.js     # RBAC (ADMIN, STAFF, CUSTOMER)
│   │   └── validationMiddleware.js# Joi request schema validation
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── customerValidators.js
│   │   ├── discountValidators.js
│   │   ├── invoiceValidators.js
│   │   ├── paymentValidators.js
│   │   ├── planValidators.js
│   │   ├── productValidators.js
│   │   ├── quotationValidators.js
│   │   ├── subscriptionValidators.js
│   │   └── taxValidators.js
│   ├── jobs/
│   │   └── billingJob.js         # node-cron recurring billing job with concurrency guard
│   ├── utils/
│   │   ├── generateNumber.js     # Atomic sequential number generator (INV-000001, etc.)
│   │   ├── pagination.js         # Standardized page/limit helper & envelope builder
│   │   ├── password.js           # bcrypt hashing & verification
│   │   └── response.js           # Standard success/error JSON response builders
│   ├── seed/
│   │   └── seedDatabase.js       # Comprehensive demo seed data
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # Server listener & graceful shutdown handlers
├── tests/
│   ├── auth.test.js              # Auth & RBAC test suite
│   ├── billing.test.js           # Idempotency & duplicate billing prevention
│   ├── hackathonFlow.test.js     # Full end-to-end 15-step demo flow
│   ├── payment.test.js           # Balance update & overpayment prevention
│   ├── pricing.test.js           # Tax, discount & pricing engine calculation
│   └── subscription.test.js      # Lifecycle state machine & schedule rules
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Billing Architecture & Idempotency Strategy

Recurring billing is the critical core of SubFlow. It is built to ensure **guaranteed single invoice creation per period**:

```
Cron Scheduler (every minute: * * * * *)
          │
          ▼
billingJob.js (concurrency guard prevents overlapping runs)
          │
          ▼
billingService.processDueSubscriptions()
          │
          ├─► Query: { status: 'ACTIVE', nextBillingDate: { $lte: now } }
          │
          ▼
billingService._billSubscription(subscription)
          │
          ├─► 1. Determine period string: subscriptionService.getBillingPeriodString()
          │      e.g., '2026-11' (Monthly), '2026' (Yearly), '2026-W44' (Weekly)
          │
          ├─► 2. Check existing invoice in database:
          │      Invoice.findOne({ subscriptionId, billingPeriod })
          │
          ├─► 3. Atomic Database Unique Constraint:
          │      invoiceSchema.index({ subscriptionId: 1, billingPeriod: 1 }, { unique: true })
          │      Catches duplicate key error (code 11000) and safely skips.
          │
          ├─► 4. Pricing Engine calculation with snapshotted lines, taxes, and discounts.
          │
          ├─► 5. Generate Invoice with status = 'CONFIRMED'.
          │
          ├─► 6. Advance subscription.nextBillingDate according to BILLING_FREQUENCY.
          │
          └─► 7. If subscription.expiryDate reached, transition status to 'EXPIRED'.
```

### Idempotency Guarantee
1. **Application Level**: Queries existing invoice before processing.
2. **Database Level**: Unique compound index `{ subscriptionId: 1, billingPeriod: 1 }` enforced at MongoDB storage layer.
3. Even if two workers or ticks run simultaneously, only one invoice can ever be written. The second attempt safely catches error `11000` and exits without throwing.

---

## 🧮 Unified Pricing Engine

All quotes, subscriptions, and invoices route through `pricingService.js`:
```
Line Subtotal (qty × unitPrice)
       │
       ▼
Discount Engine Evaluation
(Checks date validity, min purchase, min quantity, usage limits, product/subscription binding)
       │
       ▼
Taxable Amount = (Line Subtotal - Discount Amount)
       │
       ▼
Tax Engine Evaluation
(Resolves active taxes e.g., GST 18%, calculates tax amounts)
       │
       ▼
Grand Total = Taxable Amount + Tax Total
```

---

## 🛡️ Business Rules Implemented

1. **Email Uniqueness**: Enforced via MongoDB unique index and pre-check in authService.
2. **Customer Isolation**: Customer role queries always filter by authenticated `userId` or linked `customerId`. Customers can never see or pay others' records.
3. **Role-Based Permissions**: Only `ADMIN` can manage Products, Plans, Taxes, and Discounts. `STAFF` manages daily operations (Customers, Quotations, Subscriptions, Invoices, Payments).
4. **Subscription Lifecycle State Machine**:
   - `DRAFT` ➔ `CONFIRMED`
   - `QUOTATION` ➔ `CONFIRMED` or `CLOSED`
   - `CONFIRMED` ➔ `ACTIVE` or `CLOSED`
   - `ACTIVE` ➔ `PAUSED`, `CLOSED`, or `EXPIRED`
   - `PAUSED` ➔ `ACTIVE` or `CLOSED`
   - `CLOSED` ➔ Terminal (no further transitions permitted)
   - `EXPIRED` ➔ `ACTIVE` (Renewal)
5. **No Billing Inactive Subscriptions**: Closed, Paused, or Expired subscriptions are never billed.
6. **Immutable Historical Invoices**: Changing a product's price later does not affect past generated invoices.
7. **Overpayment Prevention**: Payments exceeding the invoice's `amountDue` are rejected.
8. **Automatic Status Transitions**:
   - Invoices transition to `PAID` once `amountDue === 0`.
   - Invoices past `dueDate` with `amountDue > 0` are derived as `OVERDUE`.
9. **MongoDB Aggregations for Analytics**: Dashboard statistics are computed entirely in MongoDB pipelines using `$facet`, `$group`, `$sum`, `$match`, avoiding large in-memory Node.js processing.
10. **PDF Invoicing**: Invoices generate on-the-fly via PDFKit stream with customer address, itemized breakdown, discounts, taxes, and status.

---

## 📡 API Reference

All routes are prefixed with `/api`.

### Standard Response Envelopes

**Success (200/201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated Collection (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

---

### Route Endpoints Matrix

| Endpoint | Method | Allowed Roles | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | | | |
| `/api/auth/register` | `POST` | Public | Register new user (auto-creates customer if role is CUSTOMER) |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/auth/forgot-password` | `POST` | Public | Send password reset token (logs to dev console if no SMTP) |
| `/api/auth/reset-password` | `POST` | Public | Reset password using valid token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile and linked customer entity |
| **Customers** | | | |
| `/api/customers` | `GET` | Admin, Staff, Customer | Paginated list (scoped for Customer) |
| `/api/customers/:id` | `GET` | Admin, Staff, Customer | Customer details |
| `/api/customers` | `POST` | Admin, Staff | Create customer profile |
| `/api/customers/:id` | `PATCH` | Admin, Staff, Customer | Update customer details |
| `/api/customers/:id` | `DELETE` | Admin | Delete customer |
| **Products** | | | |
| `/api/products` | `GET` | Authenticated | List active products with variants |
| `/api/products/:id` | `GET` | Authenticated | Product details |
| `/api/products` | `POST` | Admin | Create product |
| `/api/products/:id` | `PATCH` | Admin | Update product |
| `/api/products/:id` | `DELETE` | Admin | Delete product |
| **Plans** | | | |
| `/api/plans` | `GET` | Authenticated | List plans with billing frequencies |
| `/api/plans/:id` | `GET` | Authenticated | Plan details |
| `/api/plans` | `POST` | Admin | Create plan |
| `/api/plans/:id` | `PATCH` | Admin | Update plan |
| `/api/plans/:id` | `DELETE` | Admin | Delete plan |
| **Quotations** | | | |
| `/api/quotations` | `GET` | Admin, Staff, Customer | List quotations |
| `/api/quotations/:id` | `GET` | Admin, Staff, Customer | Quotation details |
| `/api/quotations` | `POST` | Admin, Staff | Create quotation with calculated pricing |
| `/api/quotations/:id` | `PATCH` | Admin, Staff | Update quotation lines & recalculate |
| `/api/quotations/:id/confirm` | `POST` | Admin, Staff | Confirm quotation (DRAFT ➔ CONFIRMED) |
| `/api/quotations/:id/convert-to-subscription` | `POST` | Admin, Staff | Convert to subscription atomically |
| **Subscriptions** | | | |
| `/api/subscriptions` | `GET` | Admin, Staff, Customer | List subscriptions |
| `/api/subscriptions/:id` | `GET` | Admin, Staff, Customer | Subscription details |
| `/api/subscriptions` | `POST` | Admin, Staff | Create subscription manually |
| `/api/subscriptions/:id` | `PATCH` | Admin, Staff | Update subscription lines/terms |
| `/api/subscriptions/:id/activate` | `POST` | Admin, Staff | Activate subscription (schedules billing date) |
| `/api/subscriptions/:id/pause` | `POST` | Admin, Staff | Pause subscription |
| `/api/subscriptions/:id/resume` | `POST` | Admin, Staff | Resume paused subscription |
| `/api/subscriptions/:id/renew` | `POST` | Admin, Staff | Renew expired subscription |
| `/api/subscriptions/:id/close` | `POST` | Admin, Staff | Close subscription permanently |
| **Invoices** | | | |
| `/api/invoices` | `GET` | Admin, Staff, Customer | List invoices (supports `?status=OVERDUE`) |
| `/api/invoices/:id` | `GET` | Admin, Staff, Customer | Invoice details |
| `/api/invoices` | `POST` | Admin, Staff | Create manual invoice |
| `/api/invoices/:id/confirm` | `POST` | Admin, Staff | Confirm draft invoice |
| `/api/invoices/:id/cancel` | `POST` | Admin, Staff | Cancel invoice |
| `/api/invoices/:id/send` | `POST` | Admin, Staff | Send invoice notification email |
| `/api/invoices/:id/pdf` | `GET` | Admin, Staff, Customer | Stream PDFKit rendered invoice |
| **Payments** | | | |
| `/api/payments` | `GET` | Admin, Staff, Customer | List payments |
| `/api/payments/:id` | `GET` | Admin, Staff, Customer | Payment details |
| `/api/payments` | `POST` | Admin, Staff, Customer | Record payment & update invoice balance |
| **Discounts** | | | |
| `/api/discounts` | `GET` | Admin, Staff | List discounts |
| `/api/discounts/:id` | `GET` | Admin, Staff | Discount details |
| `/api/discounts` | `POST` | Admin | Create discount rule |
| `/api/discounts/:id` | `PATCH` | Admin | Update discount rule |
| `/api/discounts/:id` | `DELETE` | Admin | Delete discount rule |
| **Taxes** | | | |
| `/api/taxes` | `GET` | Admin, Staff | List taxes |
| `/api/taxes/:id` | `GET` | Admin, Staff | Tax details |
| `/api/taxes` | `POST` | Admin | Create tax rate |
| `/api/taxes/:id` | `PATCH` | Admin | Update tax rate |
| `/api/taxes/:id` | `DELETE` | Admin | Delete tax rate |
| **Dashboard / Analytics** | | | |
| `/api/dashboard/summary` | `GET` | Admin, Staff | Aggregated MRR, ARR, active subs, overdue |
| `/api/dashboard/revenue` | `GET` | Admin, Staff | Monthly revenue breakdown (`startDate`, `endDate`) |
| `/api/dashboard/subscriptions` | `GET` | Admin, Staff | Subscriptions count grouped by status |
| `/api/dashboard/invoices` | `GET` | Admin, Staff | Invoices count & amount grouped by status |
| `/api/dashboard/payments` | `GET` | Admin, Staff | Payments breakdown by payment method & month |
| **Health** | | | |
| `/api/health` | `GET` | Public | System health check (`status: healthy`) |

---

## 💻 Frontend Integration (React + Vite)

The backend is built for zero friction integration with the SubFlow React frontend:

1. **CORS is pre-configured** for `http://localhost:5173` with credentials enabled.
2. **Predictable JSON Envelopes**: Always `{ success: true, data: ... }` on success, or `{ success: false, error: { code, message, details } }` on failure.
3. **Authentication Header**: Send the JWT token as `Authorization: Bearer <token>`.
4. **Pagination**:
   ```javascript
   const fetchInvoices = async (page = 1, limit = 20, status = '') => {
     const query = new URLSearchParams({ page, limit, status }).toString();
     const res = await fetch(`http://localhost:5000/api/invoices?${query}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const json = await res.json();
     return json; // { success: true, data: [...], pagination: { page, limit, total, totalPages } }
   };
   ```
5. **PDF Viewing / Download**:
   Direct link for download or embed in an `<iframe>`:
   ```html
   <a href="http://localhost:5000/api/invoices/:id/pdf" target="_blank">Download PDF</a>
   ```

---

## 💡 Assumptions & Design Choices

1. **Modular Monolith**: Designed with strict boundary separation between controllers, models, and domain services (`pricingService`, `billingService`, `paymentService`) so they can be extracted into microservices if needed without re-architecting data contracts.
2. **Sequence Numbers**: Sequential identifiers (`INV-000001`, `SUB-000001`, etc.) use an atomic MongoDB `$inc` counter collection, ensuring monotonically increasing, collision-free numbers without table locks.
3. **Currencies**: Amounts are stored as standard 2-decimal numbers (e.g., INR ₹ or USD $), rounded using `Math.round(val * 100) / 100` to prevent IEEE 754 floating-point inaccuracies.
4. **Nodemailer Fallback**: In development or demo environments where SMTP credentials might not be configured, email notifications (password reset, invoice notification, payment confirmation) log safely to the console instead of failing or blocking request lifecycles.
