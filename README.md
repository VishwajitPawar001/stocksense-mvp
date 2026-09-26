# 📦 StockSense IMS — Enterprise Modular Inventory Management System

**StockSense** is an enterprise-grade, real-time Inventory Management System (IMS) engineered with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **PostgreSQL 16**, **NextAuth v5**, and **TailwindCSS v4**. It features an immutable stock movement ledger, ACID-compliant database transactions, dynamic multi-facility scoping, 2-Step 2FA OTP security, and complete warehouse logistics tracking.

---

## 📑 Table of Contents
1. [Project Overview & Key Objectives](#-project-overview--key-objectives)
2. [Technology Stack & Architectural Decisions](#-technology-stack--architectural-decisions)
3. [Relational Database Schema (PostgreSQL)](#-relational-database-schema-postgresql)
4. [Core Features & Operational Workflows](#-core-features--operational-workflows)
5. [Team Work Breakdown & Responsibilities](#-team-work-breakdown--responsibilities)
6. [Development Journey & Technical Hurdles](#-development-journey--technical-hurdles)
7. [10-Minute Presentation & Demonstration Guide](#-10-minute-presentation--demonstration-guide)
8. [Local Installation & Setup Guide](#-local-installation--setup-guide)

---

## 🎯 Project Overview & Key Objectives

Traditional inventory systems frequently suffer from data desynchronization, untracked inventory shrinkage, manual data entry errors, and poor visibility across multiple warehouses. 

**StockSense** solves these core operational challenges:
- **Immutable Stock Ledger**: Every inventory change (inbound, outbound, transfer, adjustment) is permanently logged with an audit trail, timestamp, and responsible personnel.
- **ACID Transaction Safety**: Prevents negative inventory and race conditions using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
- **Dynamic Multi-Warehouse Hub**: Switch between facilities or view global consolidated analytics with automatic server-side revalidation.
- **Enterprise Security**: 2-Step OTP 2FA login, strict password strength engine, and Next.js route guard middleware.

---

## 🛠️ Technology Stack & Architectural Decisions

| Layer | Technology | Key Role & Implementation Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router) & React 19** | Zero-bundle Server Components for fast data queries, React 19 hooks for client-side forms and modal interactivity. |
| **Styling & Theme** | **TailwindCSS v4 & Obsidian Design** | Dark enterprise obsidian sidebar, high-contrast slate data tables, color-coded badges, and responsive sliding drawers. |
| **Backend & Mutations** | **Next.js Server Actions (`'use server'`)** | Type-safe server mutations eliminating REST boilerplate with direct validation and instant path revalidation. |
| **Database & Pooling** | **PostgreSQL 16 (`pg` Connection Pool)** | Relational data integrity, foreign key constraints, and transactional consistency (`BEGIN`/`COMMIT`/`ROLLBACK`). |
| **Authentication & RBAC** | **NextAuth v5 (Auth.js) + 2FA OTP** | JWT session strategy, bcrypt password hashing, 60s OTP verification simulator, and route protection middleware. |

---

## 🗄️ Relational Database Schema (PostgreSQL)

StockSense provisions 7 normalized, interconnected tables upon application boot:

```mermaid
erDiagram
    warehouses ||--o{ locations : "houses"
    warehouses ||--o{ products : "stores"
    warehouses ||--o{ operations : "executes"
    warehouses ||--o{ move_history : "logs"
    products ||--o{ operation_lines : "referenced_in"
    products ||--o{ move_history : "tracked_in"
    operations ||--o{ operation_lines : "contains"

    users {
        int id PK
        string login_id UK
        string email UK
        string password_hash
    }
    warehouses {
        int id PK
        string name
        string short_code UK
        string address
    }
    locations {
        int id PK
        int warehouse_id FK
        string name
    }
    products {
        int id PK
        string name
        string sku UK
        string category
        string uom
        float cost_price
        int quantity_on_hand
        int warehouse_id FK
    }
    operations {
        int id PK
        string reference UK
        string operation_type
        string status
        string contact
        string schedule_date
        string responsible
        int warehouse_id FK
    }
    operation_lines {
        int id PK
        int operation_id FK
        int product_id FK
        int demand_qty
    }
    move_history {
        int id PK
        string reference
        int product_id FK
        int quantity
        string movement_type
        string date
        string responsible
        int warehouse_id FK
    }
```

---

## ⚡ Core Features & Operational Workflows

### 1. Dynamic Multi-Warehouse Hub
- **Interactive Switcher**: Click the warehouse badge in the sidebar to toggle between facilities (e.g., *Central Warehouse WH01*, *Regional Logistics Depot WH02*, *Cold Storage WH03*) or select *All Facilities (Global)*.
- **Server Scoping**: Automatically scopes the KPI cards, Product catalog, Operations ledger, and Move History to the active warehouse via cookie context.

### 2. Operations & Logistics Hub
- **Inbound Receipts (`WH/IN/000X`)**: Receive incoming shipments from suppliers, auto-increment on-hand stock, and log receipt ledger events.
- **Outbound Deliveries (`WH/OUT/000X`)**: Pick, pack, and validate customer dispatches. Employs `SELECT ... FOR UPDATE` row locking to prevent negative stock.
- **Internal Transfers (`WH/INT/000X`)**: Move inventory between racks, shelves, and internal zones (e.g., *Rack A-01 ➔ Production Floor*).
- **Stock Adjustments (`WH/ADJ/000X`)**: Reconcile physical inventory counts against system records with automated delta computation (+/-).

### 3. Master Data Products Catalog
- Real-time category filtering (Electronics, Hardware, Furniture, Chemicals, Packaging, Tools, Safety).
- Instant live search by Product Name or SKU.
- Full CRUD modals (Create, Edit, Delete with dependent checks).

### 4. Immutable Stock Ledger & Move History
- Filter by movement type (`IN`, `OUT`, `INTERNAL`, `ADJUSTMENT`).
- Real-time text search across Reference, Product Name, SKU, and Responsible user.
- **Export to CSV**: One-click download of the complete stock movement history.

---

## 👥 Team Work Breakdown & Responsibilities

| Team Member | Role & Track | Key Modules & Features Delivered |
| :--- | :--- | :--- |
| **Vishwajit Pawar** | **Lead Architect & Fullstack Engineer**<br/>*(Track 1)* | • NextAuth v5 2FA OTP authentication & password complexity engine.<br/>• Strict Route Guard Middleware protecting private IMS paths.<br/>• Obsidian enterprise App Shell, responsive mobile drawer & layout.<br/>• Executive KPI Aggregate Dashboard & live metrics.<br/>• Dynamic multi-warehouse switching with cookie scoping & branch harmonization. |
| **Chandrashekhar** | **Backend & Logistics Engineer**<br/>*(Track 2)* | • Inbound Goods Receipts (+ New Receipt Modal) with stock increment.<br/>• Outbound Delivery Orders (+ Delivery Modal) with negative balance guard.<br/>• Core PostgreSQL ACID transactions and rollback handling.<br/>• Stock Ledger UI with real-time filtering & CSV export engine. |
| **Rohit Patil** | **Frontend & Settings Engineer**<br/>*(Track 3)* | • Master Data Products Catalog CRUD & category pills.<br/>• Multi-Warehouse & Storage Rack Settings configuration.<br/>• Internal Stock Transfers (rack-to-rack movements).<br/>• Physical Count Stock Adjustments with automated delta reconciliation. |

---

## 🚀 Development Journey & Technical Hurdles

1. **Migration from SQLite to PostgreSQL**: Replaced single-file SQLite with an enterprise PostgreSQL connection pool (`pg`), eliminating database file locks and concurrency limits.
2. **App Router `'use server'` Rule Separation**: Resolved Next.js compilation constraints by separating NextAuth client instances into `src/auth.ts` while keeping server action async mutations in `src/actions/*.ts`.
3. **Race Condition Prevention**: Added row-level locking (`SELECT ... FOR UPDATE`) in stock deductions to guarantee accurate balance integrity during simultaneous dispatches.
4. **Three-Way Branch Harmonization**: Successfully audited and unified independent feature branches into a single, cohesive architecture without regressions.

---

## 🎙️ 10-Minute Presentation & Demonstration Guide

Use this timeline during your presentation / viva demonstration:

| Time | Segment | Talking Points & Demonstration Cues |
| :--- | :--- | :--- |
| **0:00 - 1:30** | **Introduction & Problem Statement** | Hook the audience with inventory failure modes (stockouts, shrinkage, spreadsheet errors). Introduce StockSense as a real-time, ledger-backed IMS. |
| **1:30 - 3:00** | **Architecture & DB Design** | Walk through the Next.js 16 + PostgreSQL + NextAuth v5 tech stack. Show the 7-table schema, ACID transactions, and double-entry immutable ledger. |
| **3:00 - 4:30** | **Authentication & Security Demo** | **Live Demo:** Demonstrate Route Guard redirect to `/auth/login`, 2-Step OTP verification, and live password strength checklist. |
| **4:30 - 6:30** | **Dashboard & Facility Switcher** | **Live Demo:** Tour the 5 KPI metric cards. Click the **Warehouse Switcher** to dynamically scope metrics between Central Warehouse (WH01) and Logistics Depot (WH02). |
| **6:30 - 8:30** | **Operations Workflows Demo** | **Live Demo:** Execute a Receipt (stock +), test Delivery validation (blocks over-demand), perform an Internal Transfer, and show an Audit Stock Adjustment. |
| **8:30 - 9:30** | **Stock Ledger & Team Roles** | **Live Demo:** Filter the Move History ledger and click **"Export Ledger (CSV)"**. Outline Track 1, 2, and 3 team contributions. |
| **9:30 - 10:00** | **Conclusion & Q&A** | Summarize scalability, enterprise readiness, and invite evaluator questions. |

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.x or v20+ with npm
- **PostgreSQL**: 16.x (Running on port `5432`)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/VishwajitPawar001/stocksense-mvp.git
cd stocksense-mvp
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env.local` in the project root:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/stocksense
AUTH_SECRET=stocksense_super_secret_jwt_key_2026_secure
```

### Step 4: Create PostgreSQL Database
```sql
psql -U postgres
CREATE DATABASE stocksense;
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application will automatically provision tables on first load.