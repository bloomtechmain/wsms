# Water Supply Management System (WSMS)

A comprehensive full-stack application for managing water utility operations, including customer management, meter readings, billing with arrears calculation, and financial reporting.

## Features

- **Dashboard**: Real-time overview of total customers, revenue, and pending tasks.
- **Customer Management**: Add, view, and manage customer profiles.
- **Meter Readings**: Record monthly readings; auto-calculates consumption.
- **Billing Engine**: 
  - Automated bill generation.
  - **Arrears Management**: Automatically carries forward unpaid balances from previous months.
  - **Detailed Bill View**: Breakdown of current charges vs. past due amounts.
- **Reports**: 
  - Revenue Analysis (Billed vs. Collected).
  - Usage Trends.
  - Customer Financial Summaries.
- **Role-Based Access**: Admin and Reader roles.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL (via `pg` driver)
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL Database installed and running

## Installation & Setup

1.  **Clone the repository** (if applicable) or navigate to the project root.

2.  **Install Dependencies**:
    The project has a root `package.json` that installs dependencies for both client and server.
    ```bash
    npm install
    ```

3.  **Database Configuration**:
    - Ensure PostgreSQL is running.
    - Create a database (e.g., `WSMS`).
    - Configure the connection string in `server/.env`.
      ```env
      DATABASE_URL="postgresql://postgres:password@localhost:5432/WSMS?schema=public"
      JWT_SECRET="your_jwt_secret_key"
      PORT=3000
      ```

4.  **Database Initialization**:
    Run the following commands from the `server` directory to set up the schema and seed data:
    ```bash
    cd server
    npm run init-db      # Creates tables and resets schema
    npm run seed-users   # Adds default admin/reader users
    npm run seed-dummy   # (Optional) Adds sample customers and readings
    cd ..
    ```

## Running the Application

To start the development environment (both Server and Client):

```bash
npm run dev
```

- **Server API**: http://localhost:3000
- **Client UI**: http://localhost:5173

## Project Structure

- `client/`: React Frontend application.
- `server/`: Express Backend application.
  - `src/controllers/`: Business logic (Billing, Readings, Reports).
  - `src/routes/`: API endpoint definitions.
  - `src/config/`: Database connection.

## Key Workflows

1.  **Adding a Reading**: Go to **Readings**, select a customer, enter the new reading. The system validates the date and previous reading.
2.  **Generating a Bill**: Bills are auto-generated upon reading submission. Arrears are calculated based on all `UNPAID` bills for that customer.
3.  **Viewing Reports**: Admins can access the **Reports** tab to see monthly revenue and usage stats.

## Troubleshooting

- **Port Conflicts**: If port 3000 is in use, the start script may fail. Use `npx kill-port 3000` or manually stop the process.
- **Database Connection**: Ensure the `DATABASE_URL` in `server/.env` is correct.
