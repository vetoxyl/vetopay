
# VetoPay User & Transaction Flow

This document outlines the step-by-step workflows for VetoPay, including user lifecycle and transaction management.

---

## 1. User Registration & Authentication

**Flow:**
1. User accesses registration form
2. Inputs name, email, password
3. Backend validates and hashes password
4. JWT token issued and sent
5. Wallet auto-created for the user
6. Redirect to dashboard

---

## 2. Login

**Flow:**
1. User enters email and password
2. Backend authenticates and returns JWT
3. Token stored (HttpOnly cookie / localStorage)
4. Redirected to role-specific dashboard

---

## 3. Wallet Operations

**Flow:**
- **View Wallet**: Balance and transaction history retrieved
- **Add Funds**:
  1. User initiates add-fund action
  2. External payment gateway opens (e.g., Stripe)
  3. On success, backend updates balance

- **Withdraw Funds**:
  1. User requests withdrawal
  2. Admin verifies and approves transaction
  3. Amount deducted and settled

---

## 4. Peer-to-Peer Transaction

**Flow:**
1. User selects recipient (by email or ID)
2. Enters amount and description
3. Backend checks balance & permissions
4. Creates pending transaction
5. Updates sender & receiver wallet balances upon approval

---

## 5. Admin Workflow

**Flow:**
- View/manage all users
- Approve/reject flagged transactions
- View audit logs
- Freeze/unfreeze accounts
- Manage notification templates

---

## 6. Notification Flow

**Triggers:**
- Transaction status changes
- Balance updates
- Admin actions on account
- System alerts

**Channels:**
- Email
- Push (optional)
- Dashboard message center
