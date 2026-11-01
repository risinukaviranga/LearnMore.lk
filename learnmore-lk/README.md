# LearnMore.lk – Learning Management System

EC4307 Web Application Development – Mini Project

LearnMore.lk lets instructors schedule **live online classes**, publish **past papers** and sell **e-books**, while students enroll in classes, download papers, buy e-books and read them in a personal online library.

**Stack:** Next.js 14 (App Router, TypeScript) · PostgreSQL · Prisma ORM · Tailwind CSS · Zod validation · JWT cookie authentication (`jose` + `bcryptjs`)

---

## Features

| Module | Create | Read (list / detail / search / filter / sort) | Update | Delete |
|---|---|---|---|---|
| **E-Books** | Add e-book | Store grid, search by title/author, filter by subject, sort by price/title/date, pagination | Edit e-book | Delete (blocked if already purchased) |
| **Past Papers** | Upload paper | Table with filters (subject, grade, year, term, free/premium), sort, pagination, watermarked preview | Edit paper | Delete paper |
| **Live Classes** | Schedule class | Upcoming/past filter, subject/grade filter, sort, detail page | Edit class | Delete class (enrollments cascade) |
| **Cart & Orders** | Add to cart, checkout (creates order) | Cart, order history/receipts, My Library | Admin updates order status; admin updates user role | Remove from cart |
| **Users** | Register | Admin user list | Admin changes role | – |

Other points

- **Roles:** Student, Instructor, Admin. Permissions are enforced on the server (middleware + every server action). Instructors can only edit/delete their own content; admins can manage everything.
- **Validation:** HTML5 client-side validation (required, min/max, `type=url`, etc.) **and** server-side Zod validation with per-field error messages.
- **Attendance:** students enrolled in a class can check in from 15 minutes before the start until the class ends; instructors see the attendance list.
- **Reader:** purchased e-books open in an in-app PDF reader (toolbar hidden, no raw download link, watermarked with the buyer's email).
- **Payments:** the checkout is a **demo** (simulated PayHere / Stripe / PayPal). In production this step is replaced by the gateway redirect + webhook.
- **File storage:** PDFs are stored as URLs (S3 / Cloudflare R2 in production). The seed data uses a public sample PDF.

---

## Run locally (VS Code)

### 1. Prerequisites
- Node.js **18.18+** (20 or 22 recommended) – https://nodejs.org
- PostgreSQL **14+** – https://www.postgresql.org/download/ (remember the password you set for the `postgres` user)
- VS Code

### 2. Create the database
Open **pgAdmin** (or `psql`) and create an empty database called `learnmore`:

```sql
CREATE DATABASE learnmore;
```

### 3. Configure environment
Copy `.env.example` to `.env` and edit the password if yours is different:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnmore?schema=public"
AUTH_SECRET="any-long-random-string-at-least-32-characters"
```

### 4. Install, create tables, add demo data, start

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo accounts (created by the seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@learnmore.lk | Admin@123 |
| Instructor | teacher@learnmore.lk | Teacher@123 |
| Instructor | kasun@learnmore.lk | Teacher@123 |
| Student | student@learnmore.lk | Student@123 |

### Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build && npm start` | Production build and run |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run db:reset` | Drop all data, recreate tables and re-seed |

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ ClassSession : "teaches"
    User ||--o{ Enrollment : "enrolls"
    ClassSession ||--o{ Enrollment : "has"
    User ||--o{ Paper : "uploads"
    User ||--o{ EBook : "publishes"
    User ||--o{ CartItem : "adds"
    EBook ||--o{ CartItem : "in"
    User ||--o{ Order : "places"
    Order ||--o{ OrderItem : "contains"
    EBook ||--o{ OrderItem : "sold as"

    User { string id PK
      string name
      string email UK
      string passwordHash
      enum role
      datetime createdAt }
    ClassSession { string id PK
      string title
      string subject
      int grade
      datetime startsAt
      int durationMin
      string meetingUrl
      string instructorId FK }
    Enrollment { string id PK
      string userId FK
      string classId FK
      boolean attended
      datetime attendedAt }
    Paper { string id PK
      string title
      string subject
      int grade
      int year
      int term
      boolean isPremium
      string fileUrl
      string markingSchemeUrl
      string uploaderId FK }
    EBook { string id PK
      string title
      string author
      string subject
      int price
      string fileUrl
      string createdById FK }
    CartItem { string id PK
      string userId FK
      string ebookId FK }
    Order { string id PK
      int total
      string method
      enum status
      string userId FK }
    OrderItem { string id PK
      int price
      string orderId FK
      string ebookId FK }
```

Unique constraints: `User.email`, `Enrollment(userId, classId)`, `CartItem(userId, ebookId)`, `OrderItem(orderId, ebookId)`.

## Project structure

```
prisma/            schema.prisma, seed.ts
src/actions/       server actions (auth, ebooks, papers, classes, shop, admin)
src/app/           pages (App Router): ebooks, papers, classes, cart, orders, library, dashboard, login, register
src/components/    reusable UI (Navbar, forms, Pagination, ConfirmButton, Flash)
src/lib/           prisma client, auth (JWT), validation (Zod), formatting helpers
src/middleware.ts  route protection
```

## Screenshots

Add your screenshots to a `docs/` folder and link them here:

- Home, Login / Register
- E-book store (search + filter), E-book form with validation errors
- Papers list and watermarked preview
- Class detail (enroll / check-in) and instructor attendance list
- Cart / checkout, Orders, My Library reader
- Admin dashboard
