# Finance Tracker — App Spec

Personal finance tracker running on localhost. Single user, SQLite-backed.

## Stack

- **Runtime**: Bun (no Node)
- **Monorepo**: Bun workspaces — `server/` and `web/`
- **Backend**: Elysia (TypeScript), port 3000
- **Frontend**: React + Vite (TypeScript), port 5173
- **Database**: SQLite via Drizzle ORM
- **Storage**: Local `.sqlite` file

## Features

### 1. Health Check
- `GET /` returns server status

### 2. Budget Categories
- Create a budget category (name)
- List all budget categories
- _Delete: not needed for now_

### 3. Transactions
- Add a transaction with:
  - description (text)
  - date
  - amount (number, positive = income, negative = expense)
  - payment method (e.g. credit card, debit, cash, pix)
  - budget category (FK to budget categories)
  - type: `subscription` | `discretionary`
- Remove a transaction by ID
- List transactions (with optional filters: by date range, category, type)
- _Update: not needed_

## Data Model

### `budget_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK, auto-increment |
| name | text | unique, not null |
| created_at | timestamp | default now |

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK, auto-increment |
| description | text | not null |
| date | text (ISO date) | not null |
| amount | real | not null |
| payment_method | text | not null |
| category_id | integer | FK → budget_categories.id |
| type | text | `subscription` or `discretionary` |
| created_at | timestamp | default now |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/categories` | Create category |
| GET | `/categories` | List categories |
| POST | `/transactions` | Add transaction |
| DELETE | `/transactions/:id` | Remove transaction |
| GET | `/transactions` | List transactions (query params for filtering) |

## Frontend

### Design Principles
- Clean, minimal UI with plenty of whitespace
- Neutral color palette — white/light gray backgrounds, dark text
- Accent color (e.g. indigo/blue) used sparingly for primary actions and active tab
- Red for destructive actions (delete) and negative amounts; green for positive amounts
- System font stack for fast rendering, no custom fonts
- Consistent spacing, rounded corners on cards/inputs, subtle borders
- No heavy component library — use Tailwind CSS for utility-first styling
- Responsive but optimized for desktop (localhost use)

### Layout
- **Top bar**: App name ("Finance Tracker") on the left, no nav — just branding
- **Tab bar** below the top bar with two tabs:
  - **Transactions** (default active)
  - **Categories**
- **Content area** renders the active tab's view

### Transactions Tab

#### Transaction List
- Table with columns: Date, Description, Amount, Category, Payment Method, Type, Actions
- Rows sorted by date descending (most recent first)
- Amount displayed with currency formatting — green for positive, red for negative
- Type shown as a small pill/badge (`subscription` / `discretionary`)
- Actions column: a delete button (trash icon, red on hover) with confirmation prompt
- Filter bar above the table:
  - Date range picker (start / end)
  - Category dropdown (populated from API)
  - Type dropdown (`all` / `subscription` / `discretionary`)
  - "Clear filters" link
- Empty state: centered message "No transactions yet" with prompt to add one

#### Add Transaction
- A "+ Add Transaction" button at the top right of the tab
- Opens an inline form (or a modal) with fields:
  - Description — text input
  - Date — date picker, defaults to today
  - Amount — number input
  - Payment method — text input (free-form, e.g. "Credit Card", "Pix")
  - Category — dropdown (populated from API, required)
  - Type — radio or toggle: `subscription` | `discretionary`
- "Save" button (primary/accent color) and "Cancel" button (neutral)
- On success: form closes, transaction list refreshes
- On error: inline error message below the form

### Categories Tab

#### Category List
- Simple list/table with columns: Name, Created At
- Sorted alphabetically
- No actions (delete not needed for now)
- Empty state: "No categories yet"

#### Add Category
- A "+ Add Category" button at the top right
- Opens an inline form or small modal with a single field:
  - Name — text input
- "Save" and "Cancel" buttons
- On success: list refreshes
- Duplicate name: show inline error

### Shared UI Components
- **Tab bar**: horizontal tabs, active tab highlighted with accent underline/background
- **Button**: primary (accent bg, white text), secondary (gray outline), danger (red)
- **Table**: striped or hover-highlighted rows, responsive width
- **Form inputs**: bordered, rounded, consistent padding
- **Confirmation dialog**: simple modal for delete actions ("Are you sure?")
- **Toast/notification**: brief success/error messages after actions (optional, can use inline)

## Non-Goals (for now)
- Updating transactions or categories
- Deleting categories
- Analytics / charts / dashboards
- Authentication
- Deployment
