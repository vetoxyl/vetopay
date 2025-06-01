# VetoPay - Digital Wallet System

VetoPay is a secure, role-based digital payment system designed for seamless wallet transactions, fund transfers, and payment verifications.

## Features

- User Authentication (Register, Login, JWT auth)
- Wallet System (Balance management, Transactions)
- Fund Transfer (P2P transfers with validations)
- Admin Dashboard (User/transaction management)
- Notification System (Email and in-app notifications)
- Audit Logging (Structured logging of actions)
- API Documentation (Swagger/OpenAPI)

## Tech Stack

### Backend
- Node.js/Express
- PostgreSQL with Prisma ORM
- Redis for caching
- JWT for authentication
- Winston for logging

### Frontend
- React with Vite
- TailwindCSS for styling
- Zustand for state management
- React Hook Form with Zod validation

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vetopay.git
cd vetopay
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

3. Start the development environment:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
docker-compose exec backend npx prisma migrate dev
```

5. Access the applications:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- API Documentation: http://localhost:5000/api-docs

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

1. Build the Docker images:
```bash
docker-compose build
```

2. Deploy to production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with Zod
- CORS protection
- Helmet security headers
- Audit logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 