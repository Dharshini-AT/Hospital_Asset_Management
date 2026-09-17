# Hospital Asset Management and Maintenance Tracking — Backend

## Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` and a strong `JWT_SECRET`.
5. `npm run seed`
6. `npm run dev`

## Demo accounts
Admin: admin@hospital.com / Admin@123
Staff: anitha@hospital.com / Staff@123
Technician: arun@hospital.com / Tech@123

## Core flow
Staff creates one request → Admin assigns same request → Technician starts same request → Technician completes → asset current state updates → one immutable history record is created.

## API groups
`/api/auth`, `/api/users`, `/api/assets`, `/api/maintenance`, `/api/history`, `/api/notifications`, `/api/dashboard`

## Critical rules
- One active request per asset.
- Only ADMIN assigns.
- Only assigned TECHNICIAN starts/completes.
- Completion creates permanent history.
- History has no update/delete endpoint.
- JWT + RBAC protects APIs.
