# Agro Nexus Connect - Backend API

Complete Node.js/Express backend for the agricultural marketplace frontend.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # Database configuration
│   ├── controllers/              # Business logic
│   │   ├── authController.js     # Auth (register, login)
│   │   ├── productController.js  # Product CRUD
│   │   ├── farmerController.js   # Farmer management
│   │   ├── orderController.js    # Order management
│   │   ├── reviewController.js   # Reviews & ratings
│   │   └── categoryController.js # Categories
│   ├── models/                   # Database models
│   │   ├── User.js
│   │   ├── Farmer.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Review.js
│   │   ├── Category.js
│   │   └── index.js              # Model associations
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── farmerRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── categoryRoutes.js
│   ├── middleware/
│   │   └── auth.js               # JWT authentication & error handling
│   ├── scripts/
│   │   ├── sync-db.js            # Database sync
│   │   └── seed-db.js            # Seed sample data
│   └── index.js                  # Express app entry point
├── .env                          # Environment variables
├── docker-compose.yml            # PostgreSQL setup
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

#### Option A: Using Docker (Recommended)
```bash
docker-compose up -d
```

#### Option B: Manual PostgreSQL
Create a PostgreSQL database:
```sql
CREATE DATABASE agronexus_db;
CREATE USER agronexus WITH PASSWORD 'password';
ALTER ROLE agronexus SET client_encoding TO 'utf8';
ALTER ROLE agronexus SET default_transaction_isolation TO 'read committed';
ALTER ROLE agronexus SET default_transaction_deferrable TO on;
ALTER ROLE agronexus SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agronexus_db TO agronexus;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update as needed:

```bash
cp .env.example .env
```

Default values in `.env`:
```
DATABASE_URL=postgres://agronexus:password@localhost:5432/agronexus_db
NODE_ENV=development
PORT=4000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

### 4. Sync Database & Seed Data

```bash
# Create tables
npm run db:sync

# Seed sample data
npm run db:seed
```

### 5. Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:4000`

## API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user (requires auth)
- `POST /logout` - Logout

### Products Routes (`/api/products`)
- `GET /` - Get all products (paginated, searchable, filterable)
- `GET /:id` - Get product details
- `POST /` - Create product (farmers only)
- `PUT /:id` - Update product (farmers only)
- `DELETE /:id` - Delete product (farmers only)

### Farmers Routes (`/api/farmers`)
- `GET /` - Get all farmers
- `GET /:id` - Get farmer profile
- `PUT /:id` - Update farmer profile
- `GET /:id/products` - Get farmer's products
- `GET /dashboard` - Get dashboard stats (farmers only)

### Orders Routes (`/api/orders`)
- `GET /` - Get user's orders
- `GET /recent` - Get recent orders (farmers only)
- `POST /` - Create order
- `GET /:id` - Get order details
- `PUT /:id/status` - Update order status (sellers only)

### Reviews Routes (`/api/reviews`)
- `GET /:productId` - Get product reviews
- `POST /` - Create review
- `PUT /:id` - Update review (author only)

### Categories Routes (`/api/categories`)
- `GET /` - Get all categories
- `POST /` - Create category

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are issued on successful login/registration and expire after 7 days.

## Database Schema

### Users
- `id`, `username`, `email`, `password`, `first_name`, `last_name`, `user_type` (farmer|buyer), `profile_image`

### Farmers
- `id`, `user_id`, `location`, `farm_name`, `bio`, `rating`, `total_reviews`, `verification_status`

### Products
- `id`, `farmer_id`, `name`, `description`, `category`, `price`, `unit`, `available_quantity`, `image_url`, `is_organic`, `rating`, `total_reviews`

### Orders
- `id`, `buyer_id`, `seller_id`, `status`, `total_amount`

### OrderItems
- `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`

### Reviews
- `id`, `product_id`, `user_id`, `rating`, `comment`

### Categories
- `id`, `name`, `description`

## Sample Users (from seed)

After running `npm run db:seed`:

**Farmer 1:**
- Email: `john@example.com`
- Password: `password123`
- Farm: Green Valley Farm (Kiambu)

**Farmer 2:**
- Email: `mary@example.com`
- Password: `password123`
- Farm: Harvest Dreams Farm (Nakuru)

**Buyer:**
- Email: `buyer@example.com`
- Password: `password123`

## Error Handling

All errors return JSON with error messages:

```json
{
  "error": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Development Notes

- Models use Sequelize ORM with PostgreSQL
- Password hashing with bcryptjs (automatic on create/update)
- JWT tokens signed with `JWT_SECRET`
- All timestamps are in UTC
- Soft deletes not implemented (use DELETE endpoint)

## Troubleshooting

**Database connection failed:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

**Port already in use:**
- Change PORT in .env
- Or kill process: `lsof -ti:4000 | xargs kill`

**Dependencies installation issues:**
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
