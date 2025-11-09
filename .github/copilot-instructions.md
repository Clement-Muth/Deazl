# Deazl (pcomparator) - AI Coding Agent Instructions

## Project Overview
Deazl is a Next.js 15 price comparison and shopping list platform using **Clean Architecture + DDD** with Prisma/PostgreSQL. The monorepo structure uses Yarn workspaces and Turbo for build orchestration.

## Architecture Principles

### Domain-Driven Design Structure
```
applications/{Domain}/
├── Api/              # Server Actions ("use server" files)
├── Application/      # Application Services (orchestration)
├── Domain/          # Pure business logic
│   ├── Entities/    # Domain entities (classes extending Entity<T>)
│   ├── ValueObjects/ # Immutable value objects
│   ├── Repositories/ # Repository interfaces
│   └── Services/    # Domain services
├── Infrastructure/  # Prisma repositories, external APIs
└── Ui/             # React components specific to domain
```

**Example**: `apps/pcomparator/src/packages/applications/shopping-lists/` demonstrates this structure perfectly.

### Critical Patterns

1. **Entities are Classes**: Domain entities extend `Entity<TProps>` with immutable updates via `with*` methods
   ```typescript
   // Example: ShoppingList.entity.ts
   export class ShoppingList extends Entity<ShoppingListProps> {
     public withName(name: string): ShoppingList {
       return new ShoppingList({ ...this.props, name, updatedAt: new Date() }, this._id.toValue());
     }
   }
   ```

2. **Repository Pattern**: Interfaces in `Domain/Repositories/`, implementations in `Infrastructure/Repositories/` prefixed with `Prisma*`
   - Example: `ShoppingListRepository` → `PrismaShoppingListRepository`

3. **Application Services**: Coordinate use cases, inject repositories, handle errors
   - Pattern: `*ApplicationService` classes in `Application/Services/`
   - Example: `ShoppingListApplicationService` orchestrates CRUD operations

4. **Server Actions**: All API endpoints are Next.js Server Actions in `Api/` directories
   - Start with `"use server"` directive
   - Instantiate services directly: `new ShoppingListApplicationService(new PrismaShoppingListRepository())`
   - Validate with Zod schemas from `Domain/Schemas/`

## Development Workflow

### Essential Commands
```bash
# Development (uses Turbo)
yarn dev:pcomparator              # Start pcomparator on port 3001
yarn build:pcomparator            # Production build
yarn test:pcomparator             # Run Jest tests

# Database
yarn prisma:generate              # Generate Prisma client
yarn prisma:migrate              # Run migrations
yarn prisma:studio               # Open Prisma Studio

# Code Quality
yarn check:all                   # Run Biome linter
yarn check:fix                   # Auto-fix Biome issues
yarn typescript:check            # Type checking
yarn translation:extract         # Extract i18n strings (Lingui)
```

### Release Management (Automated)
- **Staging**: `dev` branch → auto pre-releases (e.g., `1.2.0-beta.1`) via semantic-release
- **Production**: `master` branch → stable releases (e.g., `1.2.0`)
- **Makefile shortcuts**: `make status`, `make promote VERSION=1.2.0-beta.1`, `make changelog`
- **Commit format**: Use Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE:`)

## Code Standards

### TypeScript
- **Strict mode**: No `any` types
- **Naming**: Follow `NAMING.md` - PascalCase for classes/interfaces, camelCase for functions, SCREAMING_SNAKE_CASE for constants
- **Imports**: Use `~/` alias for `src/` (configured in tsconfig)

### Biome Configuration
- **Line width**: 110 characters
- **Indentation**: 2 spaces
- **No trailing commas**, semicolons required
- **Auto-organize imports** enabled

### React + Next.js
- **Server Components by default** - use `"use client"` only when necessary (client state, hooks, events)
- **Server Actions** for mutations - defined in `Api/` folders with `"use server"`
- **i18n**: Use `@lingui/macro` - `import { Trans, t } from "@lingui/macro"` for all user-facing text
- **UI Library**: HeroUI (beta) - prefer existing components over custom implementations
- **Styling**: Tailwind CSS 4 - utility-first, responsive design

### Testing
- **Extension**: `*.spec.ts` for unit tests
- **Framework**: Jest with Testing Library
- **Coverage**: Target 80%+ for domain logic
- **Mock**: Use `jest-mock-extended` for Prisma in unit tests
- Example: `apps/pcomparator/src/applications/Profile/Infrastructure/PrismaUserRepository.spec.ts`

## Database Schema (Prisma)
Located in `apps/pcomparator/prisma/schema.prisma`:
- **User/Account/Session**: NextAuth.js authentication
- **Product/Brand/Category/Store**: Catalog entities
- **Price**: Price tracking with proof images
- **ShoppingList/ShoppingListItem/ShoppingListCollaborator**: Shopping lists with RBAC

## Common Pitfalls
1. **Don't break layer boundaries**: Domain entities should never import from Infrastructure
2. **Server Actions must be isolated**: Each file in `Api/` should export a single async function
3. **Immutable entities**: Never mutate entity props directly, always use `with*` methods
4. **Translation keys**: Always add to both `en.po` and `fr.po` in `src/translations/messages/`
5. **Turbo cache**: If builds act strangely, run `yarn turbo clean`

## Key Files to Reference
- **Architecture example**: `apps/pcomparator/src/packages/applications/shopping-lists/`
- **Entity pattern**: `src/packages/applications/shopping-lists/src/Domain/Entities/ShoppingList.entity.ts`
- **Server Action pattern**: `src/packages/applications/shopping-lists/src/Api/shoppingLists/createShoppingList.api.ts`
- **Repository interface**: `src/packages/applications/shopping-lists/src/Domain/Repositories/ShoppingListRepository.ts`
- **Prisma implementation**: `src/packages/applications/shopping-lists/src/Infrastructure/Repositories/PrismaShoppingList.infrastructure.ts`

## Monorepo Structure
- **Apps**: `apps/pcomparator` (main app), `apps/documentation` (API docs)
- **Packages**: `packages/components` (shared UI), `packages/core/system` (utilities)
- **Shared**: `@deazl/shared` package provides base `Entity`, `UniqueEntityID`, error classes
- **Build**: Turbo handles dependencies - packages build before apps

## External Integrations
- **Auth**: NextAuth.js with Google OAuth + credentials
- **Storage**: Vercel Blob for images (price proofs, avatars)
- **Search**: Algolia for product search
- **External API**: Open Food Facts for product data enrichment
