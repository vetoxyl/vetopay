# VetoPay Backend API

## Overview
VetoPay Backend is a secure, scalable RESTful API built with Node.js, Express, and PostgreSQL. It provides comprehensive wallet management, transaction processing, and user authentication services.

## Features
- 🔐 JWT-based authentication with refresh tokens
- 💰 Digital wallet management
- 💸 Secure fund transfers
- 👥 Role-based access control (User, Vendor, Admin)
- 📊 Real-time transaction tracking
- 🔔 Notification system
- 📝 Comprehensive audit logging
- 📈 Admin dashboard with analytics
- 🚀 High performance with Redis caching
- 📚 Auto-generated API documentation

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd vetopay/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the backend directory:
```env
# Database
DATABASE_URL="postgresql://vetopay_user:vetopay_pass@localhost:5432/vetopay_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_REFRESH_EXPIRE="30d"

# Server
PORT=5000
NODE_ENV=development

# Redis
REDIS_URL="redis://localhost:6379"

# Email
EMAIL_SERVICE="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@vetopay.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Admin
ADMIN_EMAIL="admin@vetopay.com"
ADMIN_PASSWORD="AdminPassword123!"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="debug"
```

### 4. Set up the database
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## Docker Setup

### Using Docker Compose (Recommended)
```bash
# From the root directory (vetopay/)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Building Docker image manually
```bash
# Build image
docker build -t vetopay-backend .

# Run container
docker run -p 5000:5000 --env-file .env vetopay-backend
```

## API Documentation
Once the server is running, visit:
- Swagger UI: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password

### Wallets
- `GET /api/wallets/me` - Get user's wallet
- `GET /api/wallets/me/transactions` - Get wallet transactions

### Transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions/stats` - Get transaction statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin (Requires Admin Role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/system-health` - System health check
- `POST /api/admin/seed` - Seed admin user

## Testing

### Run tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on sensitive endpoints
- SQL injection prevention via Prisma
- XSS protection with helmet
- CORS configuration
- Input validation with Zod
- Audit logging for all sensitive operations

## Performance Optimization
- Redis caching for session management
- Database query optimization with indexes
- Connection pooling
- Response compression
- Efficient pagination

## Monitoring
- Health check endpoint
- Structured logging with Winston
- Error tracking ready (Sentry integration)
- Performance metrics

## Development Tips

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Debugging
- Check logs in `logs/` directory
- Use `npm run dev` for hot reloading
- Enable `DEBUG=*` for verbose logging

## Production Deployment

### Environment Setup
1. Use strong, unique secrets for JWT
2. Configure production database with SSL
3. Set up Redis with authentication
4. Configure email service (SendGrid/SES)
5. Enable HTTPS with SSL certificates

### Deployment Checklist
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Enable production error handling
- [ ] Configure monitoring (CloudWatch/Datadog)
- [ ] Set up backup strategy
- [ ] Configure auto-scaling
- [ ] Enable security headers
- [ ] Set up CI/CD pipeline

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **Redis connection error**
   - Check Redis is running
   - Verify REDIS_URL

3. **Migration errors**
   - Run `npx prisma migrate reset`
   - Check schema syntax

4. **Port already in use**
   - Change PORT in .env
   - Kill process using the port

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License 