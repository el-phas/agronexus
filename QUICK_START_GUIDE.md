# 🚀 AGRO NEXUS - QUICK START IMPLEMENTATION GUIDE

> Your roadmap to production-ready in 4 weeks

---

## 📋 Phase 1: Payment Foundation (Week 1-2)

### Step 1: Setup Database Models (2-3 hours)

- [ ] Create `backend/src/models/Payment.js`
  - Copy from IMPLEMENTATION_EXAMPLES.md
  - Run `npm run db:sync`

- [ ] Update `backend/src/models/Order.js`
  - Add payment_status, delivery fields
  - Update status enum
  - Run `npm run db:sync`

- [ ] Create `backend/src/models/Transaction.js` (for audit trail)

### Step 2: Setup Daraja Integration (4-6 hours)

- [ ] Register Daraja account
  - Go to: https://developer.safaricom.co.ke/
  - Create business account
  - Get credentials

- [ ] Create `backend/src/services/daraja.js`
  - Copy from IMPLEMENTATION_EXAMPLES.md
  - Test getAccessToken()

- [ ] Create `backend/src/controllers/paymentController.js`
  - Copy from IMPLEMENTATION_EXAMPLES.md
  - Test STK push locally

- [ ] Add payment routes
  ```javascript
  // backend/src/routes/paymentRoutes.js
  import express from 'express';
  import { initiatePayment, checkPaymentStatus, handleDarajaCallback } from '../controllers/paymentController.js';
  import { authenticate } from '../middleware/auth.js';

  const router = express.Router();

  router.post('/initiate', authenticate, initiatePayment);
  router.get('/:paymentId/status', authenticate, checkPaymentStatus);
  router.post('/callback', handleDarajaCallback); // Public endpoint for Daraja webhook

  export default router;
  ```

- [ ] Add to `backend/src/index.js`:
  ```javascript
  import paymentRoutes from './routes/paymentRoutes.js';
  app.use('/api/payments', paymentRoutes);
  ```

### Step 3: Update Order Workflow (3-4 hours)

- [ ] Refactor `backend/src/controllers/orderController.js`
  - Copy createOrder from IMPLEMENTATION_EXAMPLES.md
  - Add validation
  - Add stock management
  - Use transactions

- [ ] Update `backend/src/routes/orderRoutes.js`
  - Keep existing routes
  - Verify authentication on all routes

### Step 4: Frontend Checkout (4-5 hours)

- [ ] Create `src/pages/Checkout.tsx`
  - Copy from IMPLEMENTATION_EXAMPLES.md
  - Add to routing

- [ ] Create `src/services/payments.ts`:
  ```typescript
  import { api, fetcher } from "./api";

  export const initiatePayment = (orderId: number, phoneNumber: string) =>
    fetcher(api.post('/payments/initiate', { orderId, phoneNumber }));

  export const checkPaymentStatus = (paymentId: string) =>
    fetcher(api.get(`/payments/${paymentId}/status`));

  export default { initiatePayment, checkPaymentStatus };
  ```

- [ ] Update `src/App.tsx` - add Checkout route
  ```typescript
  import Checkout from './pages/Checkout';
  
  // In routes
  <Route path="/checkout" element={<Checkout />} />
  ```

- [ ] Update Cart.tsx - "Proceed to Checkout" button
  ```typescript
  <Button onClick={() => navigate('/checkout', { state: { cartItems } })}>
    Proceed to Checkout
  </Button>
  ```

### Step 5: Testing Payment Flow (2 hours)

- [ ] Test locally:
  - Create order (should be pending-payment)
  - Initiate payment
  - Check status via polling
  - Simulate payment (Daraja sandbox)

- [ ] Verify:
  - Payment created in database
  - Order status updated to payment-confirmed
  - Callback working

---

## 🔒 Phase 2: Security & Validation (Week 2)

### Step 1: Add Input Validation (3-4 hours)

- [ ] Install joi:
  ```bash
  cd backend
  npm install joi
  ```

- [ ] Create `backend/src/middleware/validation.js`
  - Copy from IMPLEMENTATION_EXAMPLES.md

- [ ] Add to all routes:
  ```javascript
  import { validateRequest, schemas } from '../middleware/validation.js';

  router.post('/register', validateRequest(schemas.registerSchema), register);
  router.post('/orders', authenticate, validateRequest(schemas.createOrderSchema), createOrder);
  router.post('/payments/initiate', authenticate, validateRequest(schemas.initiatePaymentSchema), initiatePayment);
  ```

### Step 2: Improve Error Handling (2-3 hours)

- [ ] Create `backend/src/middleware/errorHandler.js`
  - Copy from IMPLEMENTATION_EXAMPLES.md

- [ ] Update `backend/src/index.js`:
  ```javascript
  import { errorHandler } from './middleware/errorHandler.js';
  // ... routes ...
  app.use(errorHandler); // At the end
  ```

- [ ] Test error responses (should not expose stack traces)

### Step 3: Add RBAC (Role-Based Access Control) (3-4 hours)

- [ ] Create `backend/src/middleware/rbac.js`:
  ```javascript
  export const requireRole = (roles) => {
    return async (req, res, next) => {
      const user = await User.findByPk(req.user.id);
      if (!user || !roles.includes(user.user_type)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  };
  ```

- [ ] Protect farmer routes:
  ```javascript
  router.post('/products', authenticate, requireRole(['farmer']), createProduct);
  ```

- [ ] Protect buyer routes:
  ```javascript
  router.post('/orders', authenticate, requireRole(['buyer']), createOrder);
  ```

### Step 4: Add Logging (1-2 hours)

- [ ] Create `backend/src/utils/logger.js`:
  ```javascript
  export const logPayment = (orderId, status, details) => {
    console.log(`[PAYMENT] Order ${orderId}: ${status} - ${JSON.stringify(details)}`);
    // In production, save to database
  };
  ```

- [ ] Log critical operations in payment & order controllers

---

## 📧 Phase 3: Features (Week 3)

### Step 1: Email Notifications (4-5 hours)

- [ ] Install nodemailer:
  ```bash
  npm install nodemailer
  ```

- [ ] Create `backend/src/services/email.js`:
  ```javascript
  import nodemailer from 'nodemailer';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  export const sendOrderConfirmation = async (orderData) => {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: orderData.buyerEmail,
      subject: `Order #${orderData.orderId} Confirmed`,
      html: `<h1>Order Confirmed</h1><p>Your order has been confirmed and is being processed.</p>`,
    });
  };
  ```

- [ ] Call in payment confirmation:
  ```javascript
  // In handleDarajaCallback
  if (ResultCode === 0) {
    await emailService.sendOrderConfirmation({ orderId, buyerEmail });
  }
  ```

### Step 2: Order Receipts/Invoices (3-4 hours)

- [ ] Install pdfkit:
  ```bash
  npm install pdfkit
  ```

- [ ] Create `backend/src/services/invoice.js`:
  ```javascript
  import PDFDocument from 'pdfkit';

  export const generateInvoice = (order) => {
    const doc = new PDFDocument();
    doc.fontSize(20).text('Order Invoice', 100, 100);
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Total: KES ${order.total_amount}`);
    // ... add more details
    return doc;
  };
  ```

- [ ] Create endpoint to download invoice:
  ```javascript
  router.get('/:orderId/invoice', authenticate, async (req, res) => {
    const order = await Order.findByPk(req.params.orderId);
    const doc = generateInvoice(order);
    doc.pipe(res);
    doc.end();
  });
  ```

### Step 3: Seller Payouts (4-5 hours)

- [ ] Create `backend/src/models/Payout.js`:
  ```javascript
  const Payout = sequelize.define('Payout', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'), defaultValue: 'pending' },
    account_number: DataTypes.STRING,
    bank_name: DataTypes.STRING,
  }, { tableName: 'payouts', timestamps: true });
  ```

- [ ] Create payout controller & routes
  - Calculate seller earnings from completed orders
  - Create payout request
  - Process via MPESA or bank transfer

### Step 4: Order Tracking (2-3 hours)

- [ ] Update Cart page to show order status
  ```typescript
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getOrders()
  });
  ```

- [ ] Create `src/pages/Orders.tsx` to show order history with status tracking

---

## ✅ Phase 4: Testing & Documentation (Week 4)

### Step 1: Unit Tests (6-8 hours)

- [ ] Install vitest:
  ```bash
  npm install --save-dev vitest
  ```

- [ ] Test order controller:
  ```javascript
  // backend/src/controllers/__tests__/orderController.test.js
  describe('orderController', () => {
    it('should create order with pending-payment status', async () => {
      // Test code
    });
  });
  ```

- [ ] Test payment service

### Step 2: Integration Tests (4-6 hours)

- [ ] Test complete payment flow
- [ ] Test authorization on protected routes
- [ ] Test validation

### Step 3: Documentation (3-4 hours)

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] User guide

### Step 4: Pre-Launch Checklist (2-3 hours)

- [ ] All tests passing
- [ ] No console errors
- [ ] Database backups configured
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on auth endpoints
- [ ] Error logging setup

---

## 📊 TIMELINE

```
Week 1:  Payment Models + Daraja Integration
Week 2:  Refactored Orders + Checkout Page + Validation/Security
Week 3:  Email + Invoices + Payouts + Order Tracking
Week 4:  Testing + Documentation + Launch
```

**Total: ~120 hours spread over 4 weeks**

---

## 🎯 SUCCESS CRITERIA

### Week 1 End
- [ ] Daraja API working (can initiate STK push)
- [ ] Orders create with pending-payment status
- [ ] Payments tracked in database

### Week 2 End
- [ ] Complete order-payment flow working end-to-end
- [ ] Input validation on all endpoints
- [ ] Authorization working correctly
- [ ] Checkout page accessible

### Week 3 End
- [ ] Email notifications sent on order events
- [ ] Order receipts generated
- [ ] Seller can request payouts
- [ ] Users can view order history with status

### Week 4 End
- [ ] 70%+ test coverage
- [ ] All documentation complete
- [ ] Pre-launch checklist 100% complete
- [ ] Ready to deploy

---

## 🚀 DEPLOYMENT

### Pre-Deployment

```bash
# 1. Run all tests
npm test

# 2. Build frontend
npm run build

# 3. Check environment variables
# .env file should have:
# - DATABASE_URL (production database)
# - DARAJA credentials (production account)
# - JWT_SECRET (strong, random)
# - SMTP credentials (for email)

# 4. Run database migrations
npm run db:sync
```

### Deployment Options

**Option A: Render (Recommended)**
```bash
# Push to GitHub
git push origin main

# Connect to Render, auto-deploys on push
```

**Option B: Railway**
```bash
railway init
railway up
```

**Option C: AWS/DigitalOcean/Heroku**
- Standard Node.js deployment
- PostgreSQL database
- Environment variables configuration

---

## 📞 COMMON ISSUES & FIXES

### Issue: "Daraja token invalid"
- **Solution:** Check CONSUMER_KEY and CONSUMER_SECRET
- Check if sandbox/production URL is correct
- Verify account has STK push enabled

### Issue: "Payment created but order not updating"
- **Solution:** Check webhook URL is publicly accessible
- Verify `handleDarajaCallback` endpoint is public (no auth)
- Check Daraja callback IP whitelist

### Issue: "Stock validation failing"
- **Solution:** Verify available_quantity is being decremented
- Check for race conditions in concurrent orders
- Add database-level constraints

### Issue: "Email not sending"
- **Solution:** Check SMTP credentials
- Verify Gmail app-specific passwords (not regular password)
- Check firewall/spam filters

---

## 💡 OPTIMIZATION TIPS

1. **Database:** Add indexes on frequently queried columns
   ```javascript
   // In models
   indexes: [
     { fields: ['buyer_id'] },
     { fields: ['seller_id'] },
     { fields: ['status'] },
   ]
   ```

2. **Caching:** Use Redis for token caching
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   // Cache Daraja tokens
   ```

3. **Payment Polling:** Don't poll every 3 seconds
   - Use exponential backoff
   - Use webhooks when possible

4. **Database Transactions:** Already implemented for orders
   - Consider for other critical operations

---

## 📚 RESOURCES

- **Daraja Docs:** https://developer.safaricom.co.ke/
- **Express.js:** https://expressjs.com/
- **React Query:** https://tanstack.com/query/latest
- **Sequelize:** https://sequelize.org/

---

## ✨ FINAL CHECKLIST

Before marking "production-ready":

- [ ] All 8 critical issues fixed
- [ ] Payment system fully functional
- [ ] Orders have proper lifecycle
- [ ] Authorization working
- [ ] Input validation on all endpoints
- [ ] Error handling doesn't expose secrets
- [ ] Email notifications working
- [ ] Order receipts generating
- [ ] Seller payouts available
- [ ] Tests passing (70%+ coverage)
- [ ] Documentation complete
- [ ] Performance tested (load test)
- [ ] Security audit done
- [ ] Monitoring/alerts setup
- [ ] Backup system configured
- [ ] All environment variables set
- [ ] HTTPS enforced
- [ ] Deployment checklist complete

---

## 🎉 YOU'RE READY!

Once all phases are complete, you'll have:
- ✅ Production-ready e-commerce platform
- ✅ Secure payment processing
- ✅ Proper data flow and validation
- ✅ Notification system
- ✅ Seller payout system
- ✅ Order tracking
- ✅ Full documentation
- ✅ Monitoring & alerting

**Good luck! You've got this! 🚀**

