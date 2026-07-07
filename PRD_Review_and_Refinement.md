# BharatOS: PRD Review & Refinement Plan
*Author: Senior Code Reviewer (The Complexity-Hater)*

---

## 1. The Senior Reviewer's Critique: Keep it Simple, Make it Work

Listen, your PRD is fantastic. The vision of a **Civic OS** instead of another boring chatbot is exactly how you win a hackathon. Judges are tired of ChatGPT wrappers that just search a PDF. They want to see **agency, progress tracking, and real-world utility**.

However, as your senior reviewer, I'm going to tell you the harsh truth: **If you build this using 10 different complex systems (Neo4j, standalone OCR servers, custom state machines, vector databases, multi-agent frameworks), you will fail.** It will be a buggy, fragmented mess by demo day, and it will be impossible to deploy easily.

We are going to build this with **Zero Over-Engineering**. We will let the LLM (Gemini 2.5/3.5) do the heavy lifting using structured outputs, and build a clean, unified Next.js + SQLite/Postgres system. 

Here is how we simplify every single component:

| Component | Over-Engineered Way (Avoid!) | Simple & Bulletproof Way (Build This) |
| :--- | :--- | :--- |
| **Component 1 & 4: Journey & Goals** | Custom state machine engine | Gemini generates structured JSON journeys matching a clean TypeScript schema. Database stores tasks as standard relational records. |
| **Component 2: Citizen Twin** | Complex agent-based memory stores | A single `CitizenProfile` database table containing demographics + standard JSON fields for dynamic attributes. |
| **Component 3: Knowledge Graph** | Graph Database (Neo4j) | Graph relations modeled as simple self-referencing tables (`Scheme`, `Prerequisite`, `Dependency`) or dynamically reasoned over by Gemini with a few-shot context. |
| **Component 5: Dependency Engine** | Complex graph traversal algorithms | Standard SQL queries for direct dependencies + Gemini for dynamic planning when a document is missing. |
| **Component 6: Document Intel** | Tesseract OCR + custom parsing rules | Multimodal Gemini. Send the document image/PDF directly to Gemini, ask it to return a structured JSON with `isValid`, `mismatchedFields`, and `extractedText`. |
| **Component 7 & 8: Life Events & Opportunity** | Cron jobs + background rule engines | A single, fast LLM reasoning pass on login/profile update. "Given this citizen profile, what are the top 5 life events they should prepare for and top 3 schemes they qualify for?" |
| **Component 9: Civic Score** | Complex weighted scoring algorithms | A clean, visual percentage calculation based on profile completeness + document validity + completed journey steps. |
| **Component 10: Case Manager** | Separate ticketing system | A simple `Cases` table with timeline updates. Gemini generates the case dossier (evidence summary) dynamically. |

---

## 2. Refined Tech Stack

We need a stack that is lightning fast to write, type-safe, and trivial to deploy.

*   **Frontend & Backend (Unified):** **Next.js (App Router)**. We will use React Server Components (RSC) and Server Actions. No separate FastAPI repo. Having a single repo makes deployment to Vercel/Netlify a 1-click operation.
*   **Database & ORM:** **Prisma** or **Drizzle** with **SQLite** (for local development/evaluation) and an option to switch to **PostgreSQL** (Neon/Vercel Postgres) via a single environment variable change.
*   **AI SDK:** **Google Gen AI SDK** (`@google/genai`). We will make use of `responseSchema` or structured JSON outputs to guarantee schema validity without fragile parser code.
*   **Styling & UI:** **Tailwind CSS** + **shadcn/ui** (or Radix primitives). A clean, premium dark/light mode with high-end glassmorphism and smooth micro-interactions.
*   **Deployment:** Vercel.

---

## 3. Simplified Database Schema

This is the entire database schema we need. It's clean, relational, and powerful:

```prisma
// schema.prisma

datasource db {
  provider = "sqlite" // or "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String          @id @default(cuid())
  email          String?         @unique
  phone          String          @unique
  name           String
  createdAt      DateTime        @default(now())
  profile        CitizenProfile?
  journeys       Journey[]
  documents      Document[]
  cases          CivicCase[]
}

model CitizenProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  age              Int
  occupation       String?
  monthlyIncome    Float?
  education        String?
  disabilityStatus Boolean  @default(false)
  maritalStatus    String?  @default("Single")
  locationState    String
  hasLand          Boolean  @default(false)
  benefitsClaimed  String?  // JSON array of scheme IDs/names
  dynamicData      String?  // Extra metadata stored as JSON
}

model Journey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String   // e.g., "Open a Dairy Business"
  description String?
  status      String   // "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  progress    Float    @default(0.0) // 0 to 100
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
}

model Task {
  id          String   @id @default(cuid())
  journeyId   String
  journey     Journey  @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      String   // "PENDING" | "COMPLETED" | "FAILED"
  order       Int
  linkUrl     String?  // Direct link to Gov portal if available
  documentType String? // e.g., "Aadhaar", "PAN" if this task requires uploading/verifying a doc
}

model Document {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String   // e.g., "Aadhaar Card"
  type         String   // "AADHAAR" | "PAN" | "INCOME" | "LAND" | "BIRTH"
  fileUrl      String
  status       String   // "VERIFIED" | "MISMATCH" | "EXPIRED" | "UNREADABLE"
  extractedData String? // JSON metadata extracted by Gemini
  errorDetails String? // Details if status is mismatch/expired/etc.
  verifiedAt   DateTime?
}

model CivicCase {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String   // e.g., "Unrepaired Pothole on Sector 4 Main Road"
  description String
  status      String   // "SUBMITTED" | "ASSIGNED" | "RESOLVED" | "APPEALED"
  category    String   // "ROAD" | "WATER" | "ELECTRICITY" | "SANITATION" | "OTHER"
  timeline    String   // JSON representing array of timeline events
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 4. Implementation Roadmap

### Phase 1: Setup & Design System (Day 1 - Morning)
*   Initialize Next.js project with Tailwind CSS.
*   Setup Prisma/Drizzle with SQLite.
*   Design a modern, premium dark-mode interface with Tailwind: Deep blues, neon purples, and high-contrast greens/reds for statuses. Glassmorphism cards.
*   Create shell layouts for the Dashboard, Citizen Twin Profile, Journey Viewer, Document Vault, and Case Manager.

### Phase 2: Core AI Engines (Day 1 - Afternoon)
*   **Journey Planner Route:** Create an API route or Server Action that takes a user goal, queries their profile, uses Gemini to generate a structured list of tasks/milestones, and saves it to the database.
*   **Multimodal Document Validator:** Create a file upload API that passes the document image to Gemini. Gemini returns a structured evaluation: extracted name, date of birth, document number, validity, and details on any mismatch with the Citizen Twin profile.
*   **Opportunity & Predictor Engine:** A routine that reads the database profile and uses Gemini to suggest matching schemes and life events.

### Phase 3: The Complete UI (Day 2 - Morning)
*   **Goal input:** A beautiful search/chat bar where a user inputs things like *"I want to start a tea shop"* or *"I'm retiring soon"*.
*   **Journey Kanban/Timeline:** Interactive checklists that update dynamically.
*   **Document Vault:** Shows all uploaded documents, their validation status, and direct upload buttons.
*   **Civic Health Meter:** A dashboard component displaying profile readiness score.
*   **Case Manager Timeline:** A visual ticket progress tracker with photo evidence uploading.

### Phase 4: Testing & Polish (Day 2 - Afternoon)
*   Write unit tests for the Gemini JSON schemas.
*   Test deployment on Vercel.
*   Review accessibility (contrast ratios, keyboard navigation, screen reader hints) to nail the evaluation criteria.

---

## 5. Next Steps

Let's initialize the Next.js project and set up the foundation immediately. 

> [!NOTE]
> We will stick to a single, clean repo directory structure:
> * `/app` (Next.js Pages & Layouts)
> * `/components` (Reusable UI components)
> * `/lib` (AI utils, Prisma client, Helper functions)
> * `/prisma` (DB schema and seed scripts)

No complexity. No lag. Max speed. Let's build!
