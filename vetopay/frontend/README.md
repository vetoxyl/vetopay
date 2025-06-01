# VetoPay Frontend

## Overview
VetoPay Frontend is a modern, responsive web application built with React, Vite, and TailwindCSS. It provides an intuitive interface for digital wallet management, fund transfers, and financial tracking.

## Features
- 🎨 Modern UI with TailwindCSS
- 📱 Fully responsive design
- 🔐 Secure authentication flow
- 💰 Real-time wallet management
- 💸 Instant fund transfers
- 📊 Transaction history and analytics
- 🔔 Real-time notifications
- 👥 Role-based access control
- 📈 Admin dashboard
- 🚀 Optimized performance with Vite

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Heroicons
- **Date Utils**: date-fns

## Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd vetopay/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Wallet.jsx
│   ├── Transactions.jsx
│   ├── SendMoney.jsx
│   ├── Profile.jsx
│   ├── Notifications.jsx
│   └── admin/         # Admin pages
├── components/         # Reusable components
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   └── ...
├── store/             # Zustand stores
│   ├── authStore.js
│   ├── walletStore.js
│   └── notificationStore.js
├── config/            # Configuration
│   └── api.js
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Features Guide

### Authentication
- **Login**: Email and password authentication
- **Register**: Create new account with role selection (User/Vendor)
- **Forgot Password**: Reset password via email
- **JWT Tokens**: Secure token-based authentication with refresh tokens

### User Dashboard
- View wallet balance
- Recent transactions
- Monthly statistics
- Quick actions (Send Money, Add Funds, View History)

### Wallet Management
- Real-time balance display
- Transaction history
- Wallet status (Active/Suspended/Frozen)

### Send Money
- Transfer funds to other users
- Real-time balance validation
- Transaction confirmation
- Email notifications

### Transactions
- Complete transaction history
- Filter by status, date, type
- Transaction details view
- Export functionality

### Notifications
- Real-time notification updates
- Mark as read/unread
- Filter by type
- Notification preferences

### Profile Management
- Update personal information
- Change password
- Account settings

### Admin Dashboard
- User management
- Transaction monitoring
- System analytics
- Audit logs
- System health monitoring

## State Management

The app uses Zustand for state management with the following stores:

- **authStore**: User authentication, tokens, profile
- **walletStore**: Wallet data, transactions, statistics
- **notificationStore**: Notifications, unread count

## API Integration

- Axios instance with interceptors for authentication
- Automatic token refresh
- Global error handling
- Request/response logging

## Styling

- TailwindCSS for utility-first styling
- Custom color palette with primary brand colors
- Responsive breakpoints
- Custom component classes in `index.css`

## Security

- JWT token storage in localStorage (with httpOnly cookie support)
- Automatic token refresh
- Protected routes
- Input validation with Zod
- XSS protection

## Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Bundle optimization with Vite
- Efficient re-renders with Zustand

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Static Hosting

The `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production
```env
VITE_API_URL=https://api.vetopay.com/api
```

## Development Tips

### Component Development
- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic

### State Management
- Use Zustand stores for global state
- Keep component state local when possible
- Use React Query for server state (optional)

### Styling
- Use TailwindCSS classes
- Create custom utility classes for repeated patterns
- Use CSS modules for component-specific styles

### Testing
- Write unit tests for utilities
- Test components with React Testing Library
- E2E tests with Cypress/Playwright

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on port 5000
   - Check VITE_API_URL in .env
   - Verify CORS settings

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all imports

3. **Style Issues**
   - Ensure TailwindCSS is properly configured
   - Check PostCSS configuration
   - Clear browser cache

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License 