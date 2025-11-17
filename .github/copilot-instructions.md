# **Deazl (pcomparator) – AI Coding Agent Instructions**

## **Project Overview**

Deazl is a Next.js 15 price comparison and shopping platform built using **Clean Architecture + Domain-Driven Design (DDD)**.
It follows a strict separation of responsibilities across **Domain**, **Application**, **API**, and **UI** layers.

The project uses:

* **Next.js 15 App Router**
* **Prisma + PostgreSQL**
* **Yarn workspaces + Turbo**
* **HeroUI**, Tailwind CSS 4, Lingui
* **Strict TypeScript**

Your goal is to always generate code that respects these architecture rules **without exceptions**.

---

# **1. Architecture Principles**

## **1.1 Folder Structure (MANDATORY)**

```
applications/{Domain}/
├── Api/              # Server Actions (Next.js)
├── Application/      # Application Services (Use cases)
├── Domain/           # Pure business logic ONLY
│   ├── Entities/     # Domain entities (immutable, classes)
│   ├── ValueObjects/ # Business rules, validation, invariants
│   ├── Repositories/ # Repository interfaces
│   └── Services/     # Domain services (business rules)
├── Infrastructure/   # Prisma repositories (DB), external APIs
└── Ui/               # Components for this specific domain
```

This folder structure is **NOT negotiable**. Everything must be placed in the correct layer.

---

# **2. Domain-Driven Design Rules**

This project uses **Rich Domain Models**.

Copilot **must always enforce these constraints**:

## **2.1 Domain Layer**

The **Domain** layer contains ALL BUSINESS LOGIC.
It must NEVER import from Application, API, UI, or Infrastructure.

### You must place here:

* Entities
* Value Objects
* Domain Services
* Business Errors
* Repository Interfaces
* Zod schemas (only business validation)

### You must NOT place here:

* Prisma client
* Fetch, external APIs
* Server actions
* Anything async
* UI logic
* App state
* Next.js specifics

### **2.1.1 Entities**

Entities are **classes** extending `Entity<TProps>`.

* Must be **immutable**
* Must expose **with*() methods** for state changes
* Must validate invariants

```ts
export class ShoppingList extends Entity<ShoppingListProps> {
  public withName(name: string): ShoppingList {
    return new ShoppingList(
      { ...this.props, name, updatedAt: new Date() },
      this._id.toValue()
    )
  }
}
```

### **2.1.2 Value Objects**

* No identity
* Immutable
* Validate invariants in constructor
* Contain **micro-rules of business logic**

### **2.1.3 Domain Services**

Use this only when:

* The logic does not naturally belong to an Entity or VO
* It coordinates several domain objects
* It must remain purely business, no async, no I/O

---

## **2.2 Application Layer**

The **Application** layer contains **use cases**.

It coordinates:

* repositories (interfaces)
* entities
* domain logic
* side effects (but NEVER UI)

### Responsibilities:

✔️ Fetch and save domain aggregates
✔️ Call domain business logic
✔️ Handle errors
✔️ Map entities ↔ persistence models
✔️ Orchestrate processes

### Important:

* Application Services are **classes named `*ApplicationService`**
* They receive repositories through constructor injection
* They never contain UI logic
* They never directly use Prisma (only through Repository implementations)

---

## **2.3 Infrastructure Layer**

Contains **technical implementations**, never business logic.

Example responsibilities:

* Prisma repositories
* External API clients (OpenFoodFacts, Algolia, etc.)
* Mappers
* Vercel Blob adapters

Everything here is **replaceable** and must match repository interfaces.

File naming:

```
PrismaShoppingListRepository.infrastructure.ts
```

---

## **2.4 Api Layer**

The **Api** layer contains:

* **Next.js Server Actions**
* `"use server"` functions
* Input validation
* DTO preparation
* Use case execution

### Rules:

* One Server Action per file
* Must import Application Service + Repository implementation
* Must validate params with Zod schemas from Domain/Schemas
* Must NOT contain business logic
* Must NOT contain UI logic

---

## **2.5 Ui Layer**

The **Ui** folder contains domain-specific React components.

### The UI layer MUST:

✔️ Display data
✔️ Send mutations to Server Actions
✔️ Use generated types
✔️ Translate user-facing text (Lingui)
✔️ Use HeroUI for base components
✔️ Respect SRP: one responsibility per component

### The UI layer MUST NOT:

❌ contain business logic
❌ call Prisma
❌ mutate domain entities
❌ perform computations that belong in Domain or Application
❌ break SSR unnecessarily

---

# **3. SRP – Single Responsibility Principle**

Copilot must ALWAYS enforce SRP:

### **3.1 Domain**

Each Entity / VO / Domain Service must handle **1 and only 1** business responsibility.

### **3.2 Application Services**

Each application service corresponds to **1 use case**.

### **3.3 API**

Each server action corresponds to **1 mutation only**.
Name should be explicit:

* `createProduct.api.ts`
* `archiveShoppingList.api.ts`

### **3.4 UI Components**

Each UI component should:

* stay under ~200 lines
* do **1 specific rendering task**
* no business logic
* minimal state
* no code comments

---

# **4. Development Workflow**

> Always run commands from `apps/pcomparator`

### Dev

```bash
yarn dev:pcomparator
```

### Database

```bash
yarn prisma:generate
yarn prisma:migrate
yarn prisma:studio
```

### Code Quality

```bash
yarn check:all
yarn check:fix
yarn typescript:check
yarn translation:extract
```

---

# **5. Release Management**

* `dev` → beta releases
* `master` → production releases
* Semantic-release automates everything

Use **Conventional Commits**.

---

# **6. TypeScript Standards**

* No `any`
* Strict mode
* Use `~/` import alias
* PascalCase for classes, camelCase for functions, SCREAMING_SNAKE_CASE for constants
* No comments in code

---

# **7. React + Next.js Rules**

* Server Components by default
* `"use client"` only when required
* All user-facing strings in English
* Use Lingui `Trans`
* HeroUI components preferred
* Tailwind CSS 4 utilities

---

# **8. Database (Prisma)**

See `apps/pcomparator/prisma/schema.prisma`.

---

# **9. Common Mistakes Copilot Must NEVER Make**

❌ Putting business logic in UI components
❌ Putting async code inside Domain
❌ Querying Prisma outside Infrastructure
❌ Mutating Entity state directly
❌ Mixing Server + Client in same file
❌ Creating god components > 200 lines
❌ Importing Infrastructure inside Domain
❌ Writing French anywhere

---

# **10. Key References**

Examples:

### Shopping List domain

```
apps/pcomparator/src/packages/applications/shopping-lists/
```