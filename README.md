# StockSense MVP

StockSense is an inventory management platform built with Next.js (App Router), React, TypeScript, TailwindCSS, and PostgreSQL.

---

## PostgreSQL Migration — Setup Requirements & Steps

### Requirements
- **Node.js**: v18.x or v20+ with npm
- **PostgreSQL**: 16.x – 18.x
- **Git**
- **Code Editor**: VS Code or preferred IDE
- **PostgreSQL Service**: Running on default port `5432`

---

### Setup Steps

#### 1. Install PostgreSQL
Install PostgreSQL locally including:
- PostgreSQL Server
- pgAdmin 4 (optional GUI)
- Command Line Tools (`psql`, `pg_isready`)

> **Note**: Remember the password configured for the default `postgres` superuser during installation.

#### 2. Verify PostgreSQL Service
Open PowerShell or your terminal and verify the CLI and server status:

```powershell
# Check CLI version
psql --version

# Verify server is active and accepting connections
pg_isready
```
*Expected output:* `accepting connections`

#### 3. Create the StockSense Database
Connect to PostgreSQL using `psql`:

```powershell
psql -U postgres
```

Inside the PostgreSQL prompt:

```sql
CREATE DATABASE stocksense;
\c stocksense
```

#### 4. Database Tables Initialization
StockSense utilizes automatic table initialization on application boot. When the application runs, it provisions the following 7 core tables:
- `users`
- `warehouses`
- `locations`
- `products`
- `operations`
- `operation_lines`
- `move_history`

You can verify created tables at any time in `psql`:
```sql
\dt
```

#### 5. Install Project Dependencies
From the `stocksense-mvp` folder:

```powershell
npm install
```

*Note: The project uses `pg` and `@types/pg`. Legacy SQLite dependencies have been removed.*

#### 6. Configure Environment Variables
Copy the template or create `.env.local`:

```powershell
cp .env.example .env.local
```

Ensure `.env.local` contains:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/stocksense
```
*Replace `YOUR_PASSWORD` with your local PostgreSQL `postgres` password.*

> **Important**: Do not commit `.env.local` to Git. It is excluded in `.gitignore`.

#### 7. Start the Application
Run the Next.js development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The terminal will confirm database initialization:
```text
PostgreSQL database initialized successfully.
```

---

### Verification Checklist
- [ ] PostgreSQL installed & in system `PATH`
- [ ] PostgreSQL service active (`pg_isready`)
- [ ] `stocksense` database created
- [ ] `.env.local` configured with valid database credentials
- [ ] Dependencies installed (`npm install`)
- [ ] `npm run dev` starts without errors
- [ ] Application logs `"PostgreSQL database initialized successfully."`
- [ ] `.env.local` excluded from Git staging