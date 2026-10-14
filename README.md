# Royal Orchid — Resident-First Apartment Management Portal

A modern, transparent, and security-first building management portal engineered specifically for standalone residential apartment communities (**4 Floors • 24 Units • 1 Shared Terrace • Stilt Parking**), replacing chaotic WhatsApp group coordination and manual spreadsheets.

---

## 🏢 Architectural Building Profile

* **Ground Level (±0m):** Stilt Parking, Entrance Lobby & Security Access
* **Floor 1 (+3m):** Units `101`, `102`, `103`, `104`, `105`, `106`
* **Floor 2 (+7m):** Units `201`, `202`, `203` *(Adarsh Singh)*, `204`, `205`, `206`
* **Floor 3 (+10m):** Units `301`, `302`, `303`, `304`, `305`, `306`
* **Floor 4 (+13m):** Units `401`, `402`, `403`, `404`, `405`, `406`
* **Rooftop Terrace (+16m):** Shared Common Terrace, Overhead Water Tanks, Lift Machine Room & Solar PV Array *(Hours: 6:00 AM – 10:00 PM)*

---

## 🌟 Key Features & Capabilities

### 1. Resident Self-Registration & Administrative Verification Gate
* **Self-Service Onboarding:** New residents can register directly from the portal with:
  * Full Name & Contact Mobile (for urgent announcements).
  * Email & Password.
  * **Cascading Selection:** Select Floor (1–4), dynamically filtering the 6 corresponding flats on that floor.
  * **Occupancy Claim:** Declare as **Property Owner** or **Tenant Occupant**.
  * **Separated Occupancy Tracking:** Flat occupant headcount (e.g. 3 residents) is stored on the unit record, distinct from individual user login accounts.
* **Privilege Escalation Prevention:** Self-registration is strictly locked to `Role.RESIDENT`. Users cannot self-assign `ADMIN` or `STAFF` roles.
* **Server-Side Approval Gate:** New registrations start in `PENDING` approval. Both client routes and Express API endpoints (`/api/v1/finance/*`, `/api/v1/complaints/*`, `/api/v1/flats/*`, `/api/v1/notices/*`) strictly enforce server-side approval checks (`requireApprovedUser` middleware), returning HTTP 403 Forbidden (`ACCOUNT_PENDING_APPROVAL`) until verified by management.
* **1-Click Admin Approval:** The RWA Secretary receives an instant notification banner on the dashboard to review and approve or reject resident registrations with one click.

### 2. Strict Financial Privacy & Maintenance Collections
* **Area Pro-Rated Billing:** Automated dues calculated as:
  $$\text{Total Due} = \text{Fixed Base Charge (₹500)} + (\text{Super Built-Up Area} \times \text{₹2.50/sq.ft.})$$
* **Role-Based Financial Isolation:**
  * **Residents:** Strictly restricted to viewing their personal unit fee status, payment submissions, and official receipts. Other flats' dues are completely masked.
  * **Administrator:** Complete society ledger covering all 24 units, collection totals, defaulter counts, and batch monthly dues generator.
* **Flexible Bank & UPI Payment Workflow:** Direct society QR / VPA (`royalorchid.rwa@hdfcbank`) with Bank UTR/reference submission and proof screenshot upload. Validates references between 6 and 35 alphanumeric characters (UPI, IMPS, NEFT, RTGS).
* **Duplicate UTR Protection:** Prevents duplicate payment claims across all units through both PostgreSQL unique constraints (`Payment.utrNumber @unique`) and controller-level conflict checks returning HTTP 409 Conflict with unit attribution.
* **Complete Payment Verification & Rejection Lifecycle:**
  * Status transitions: `PENDING` $\rightarrow$ `SUBMITTED_FOR_VERIFICATION` $\rightarrow$ `VERIFIED` or `REJECTED`.
  * **Admin Rejection:** Administrator can reject fraudulent or mismatched payments with mandatory rejection feedback and reviewer audit tracking (`verifiedById`).
  * **Resident Feedback & Resubmission:** Residents whose claims are rejected see an alert banner explaining the admin's reason, previous reference number, and can click "Resubmit Payment Details" with corrected info.
* **Audit-Proof PDF Receipts:** Programmatically generated PDF receipts (`RCP-YYYYMM-FLAT`) with digital verification stamps via PDFKit issued only after admin approval.
* **Transparent Expense Ledger:** Itemized common expenses (Water tankers, Cleaning, Lift AMC, Electrical repairs) visible to verified residents for total trust.

### 3. Maintenance Ticket Tracking & Operations
* **Report In-Unit or Common Area Issues:** Electrical, plumbing, lift, or general maintenance with severity level (`Emergency`, `High`, `Medium`, `Low`) and preferred inspection time slots.
* **Operations Lifecycle:** `OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.
* **Staff Assignment:** Dispatch to building technicians (e.g., Ramesh Kumar, Electrician & Plumber) with resolution remarks.

### 4. Society Notices & WhatsApp Broadcasting
* **Notice Priority System:** `Urgent` (pinned alert banner across screens), `Important`, and `General`.
* **One-Click WhatsApp Share:** Pre-formats broadcast text and deep-links directly to WhatsApp for instant community broadcast.

### 5. Architectural Aesthetics & Modern UX
* **CAD Drafting Grid Background:**
  * **Light Mode:** CAD vellum technical grid with faint 32px coordinate lines and intersection pinpoints.
  * **Dark Mode:** High-contrast digital blueprint grid.
* **Interactive 4-Tier Building Elevation Blueprint:** Interactive SVG cross-section rendering all 6 bays per floor with height markers (+16m, +13m, +10m, +7m, +3m, ±0m).
* **Smooth View Transitions:** Modern `document.startViewTransition()` radial wave bloom originating from the cursor when toggling between Dark Mode (Sun icon) and Light Mode (Moon icon).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 + TypeScript | Tailwind CSS v4, Lucide Icons, View Transitions API |
| **Backend** | Node.js + Express + TypeScript | REST APIs, HTTP-only JWT cookies, Multer, PDFKit |
| **Database** | PostgreSQL + Prisma ORM | Relational integrity, ACID transactions (100% Supabase compatible) |

---

## 📂 Project Directory Structure

```text
myGate/
├── .gitignore                          # Root ignore for node_modules, builds, secrets, uploads
├── README.md                           # Architectural documentation & developer guide
├── client/                             # React 19 Single Page Application
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html                      # Entry HTML with inline SVG favicon & theme script
│   ├── package.json
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vite.config.ts                  # Vite 8 config with Tailwind v4 & React plugin
│   ├── public/
│   │   └── .gitkeep                    # Public static directory
│   └── src/
│       ├── main.tsx                    # React DOM root render
│       ├── App.tsx                     # Main layout, route switching & approval gate
│       ├── index.css                   # CAD architectural drafting grid & View Transition CSS
│       ├── types/
│       │   └── index.ts                # TypeScript domain models (User, Flat, Due, Payment)
│       ├── context/
│       │   └── AuthContext.tsx         # User authentication, role, & approval state
│       ├── services/
│       │   └── api.ts                  # Axios HTTP client with credentials
│       ├── pages/
│       │   ├── Login.tsx               # Sign in & resident self-registration
│       │   ├── Dashboard.tsx           # 4-tier elevation blueprint & society overview
│       │   ├── DuesPage.tsx            # Unit dues card, UPI payment modal, admin ledger
│       │   ├── ComplaintsPage.tsx      # Maintenance ticket ticketing & technician assignment
│       │   ├── ExpensesPage.tsx        # Common area expense registry & transparency
│       │   ├── FlatsDirectoryPage.tsx  # 24-unit resident & occupancy directory
│       │   └── NoticesPage.tsx         # Announcements & WhatsApp broadcast sharing
│       └── components/
│           ├── auth/
│           │   └── PendingApprovalScreen.tsx # Gated screen for pending review & rejection
│           ├── common/
│           │   ├── Badge.tsx           # Status badges (PAID, PENDING, REJECTED, etc.)
│           │   ├── BuildingElevationWireframe.tsx # SVG blueprint cross-section
│           │   ├── Modal.tsx           # Reusable accessible modal dialog
│           │   └── ThemeToggle.tsx     # Smooth dark/light radial view transition
│           ├── complaints/
│           │   ├── NewComplaintModal.tsx
│           │   └── UpdateComplaintModal.tsx
│           ├── finance/
│           │   ├── AddExpenseModal.tsx
│           │   ├── PayDueModal.tsx     # Scan & Pay UPI modal with proof upload
│           │   └── VerifyPaymentModal.tsx # Admin verification & rejection with reason
│           ├── flats/
│           │   └── EditFlatModal.tsx
│           ├── layout/
│           │   └── Navbar.tsx          # Navigation header with active indicators
│           └── notices/
│               ├── NewNoticeModal.tsx
│               └── WhatsAppShareButton.tsx
└── server/                             # Express REST API Backend
    ├── .env                            # Environment variables (DATABASE_URL, JWT_SECRET, PORT)
    ├── .gitignore                      # Server ignore for node_modules, dist, uploads
    ├── package.json
    ├── tsconfig.json
    ├── uploads/                        # Runtime uploads for bill & payment proofs
    │   └── .gitkeep
    ├── prisma/
    │   ├── schema.prisma               # PostgreSQL relational schema
    │   └── seed.ts                     # Database seeder (24 flats, residents, dues, notices)
    └── src/
        ├── server.ts                   # Express application setup & middleware
        ├── config/
        │   └── prisma.ts               # PrismaClient database connection
        ├── controllers/
        │   ├── auth.controller.ts      # Login, registration, unit query, admin approval
        │   ├── complaints.controller.ts# Issue creation, updates, and assignment
        │   ├── finance.controller.ts   # Dues calculation, payments, rejection, receipts
        │   ├── flats.controller.ts     # Flat directory & unit area management
        │   └── notices.controller.ts   # Society announcements & priority flags
        ├── middleware/
        │   ├── auth.ts                 # requireAuth, requireRole, requireApprovedUser
        │   └── upload.ts               # Multer disk storage for proof images
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── complaints.routes.ts
        │   ├── finance.routes.ts
        │   ├── flats.routes.ts
        │   └── notices.routes.ts
        ├── services/
        │   └── pdf.service.ts          # PDFKit digital receipt generator
        └── utils/
            └── jwt.ts                  # JWT token issue & verification
```

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js** (v20+)
* **PostgreSQL** running locally on port `5432` with a database named `mygate` (or Supabase connection string)

### 1. Backend Server Setup
```bash
cd server
npm install

# Push database schema & generate Prisma client
npx prisma db push

# Seed all 24 units, demo residents, dues, expenses, and notices
npm run prisma:seed

# Start development API server (runs on http://localhost:5001)
npm run dev
```

### 2. Frontend Client Setup
```bash
cd client
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Pre-Seeded Demo Accounts (Available in 1-Click UI Switcher)

| Account | Role | Email | Password | Status / Testing Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Rajesh Sharma** | RWA Secretary (Admin) | `admin@mygate.local` | `admin123` | Full administrator portal, pending registration approval queue, 24-unit collection ledger |
| **Adarsh Singh** | Resident (Flat 203) | `flat203@mygate.local` | `resident123` | October dues **Paid & Verified** • Download official PDF receipt |
| **Sunil Deshmukh** | Resident (Flat 201) | `flat201@mygate.local` | `resident123` | Payment **Submitted for Verification** (UTR awaiting admin check) |
| **Kavita Reddy** | Resident (Flat 402) | `flat402@mygate.local` | `resident123` | Dues **Pending** • Active kitchen plumbing complaint |
| **Ramesh Kumar** | Maintenance Staff | `staff@mygate.local` | `staff123` | Assigned electrical & plumbing tickets, status updater |

> **Note on Resident Accounts:** Pre-seeded resident accounts for all 24 units follow the format `flat<UNIT>@mygate.local` (e.g., `flat101@mygate.local` to `flat406@mygate.local`) with password `resident123`.

---

## ☁️ Deploying to Supabase

The backend uses standard PostgreSQL with Prisma. To deploy using Supabase:
1. Create a free PostgreSQL database at [supabase.com](https://supabase.com).
2. Copy the **Transaction / Session Connection String** from your Supabase database settings.
3. Replace `DATABASE_URL` in `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
4. Run `npx prisma db push` to initialize tables in Supabase with zero code refactoring.

