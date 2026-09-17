# MedAsset360 Frontend

React + Vite frontend for **Hospital Asset Management and Maintenance Tracking**.

## Start the frontend

From the `frontend` folder:

```powershell
npm install
npm run dev
```

The frontend expects the backend at:

```text
http://localhost:5000/api
```

This is already configured in `.env` as `VITE_API_URL`.

## Role-based UI

After login, the role stored in MongoDB automatically decides the dashboard:

- `ADMIN` → administrator dashboard, asset management, assignment, users, reports, history and notifications.
- `STAFF` → staff dashboard, asset browsing, report issue, own requests and notifications.
- `TECHNICIAN` → technician dashboard, assigned requests, maintenance completion, assets, history and notifications.

## Important workflow

1. Staff selects an Asset ID and reports an issue.
2. Backend creates one maintenance request and changes the asset to `UNDER_MAINTENANCE`.
3. Admin reviews the same request and assigns an available technician.
4. Technician opens the assigned request and starts maintenance.
5. Technician records diagnosis, work performed, parts, downtime, cost and condition.
6. Completing the request updates the asset and creates permanent maintenance history.

## Main frontend routes

- `/login`
- `/admin/dashboard`
- `/admin/assets`
- `/admin/assets/add`
- `/admin/assets/:assetId`
- `/admin/assets/:assetId/edit`
- `/admin/maintenance`
- `/admin/technicians`
- `/admin/history`
- `/admin/reports`
- `/admin/users`
- `/staff/dashboard`
- `/staff/assets`
- `/staff/report-issue`
- `/staff/requests`
- `/technician/dashboard`
- `/technician/requests`
- `/technician/assets`
- `/technician/history`

All roles also have profile and notification pages.
