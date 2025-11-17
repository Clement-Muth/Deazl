# Deazl - Smart Price Comparison & Shopping Lists

<div align="center">

![Deazl Logo](https://deazl.fr/_next/static/media/logo.af74964e.png)

**A free, open-source platform for price comparison and collaborative shopping lists**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Release](https://img.shields.io/github/v/release/Clement-Muth/pcomparator?style=for-the-badge)](https://github.com/Clement-Muth/pcomparator/releases)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/Clement-Muth/pcomparator/release.yaml?style=for-the-badge&label=CI/CD)](https://github.com/Clement-Muth/pcomparator/actions)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Deazl-Comparator/deazl?style=for-the-badge&utm_source=oss&utm_medium=github&utm_campaign=Deazl-Comparator%2Fdeazl&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

[**🌐 Live Demo**](https://deazl.fr/en) • [**📖 Documentation**](docs/DEVELOPER.md) • [**🐛 Report Bug**](https://github.com/Deazl-Comparator/deazl/issues) • [**💡 Request Feature**](https://github.com/Deazl-Comparator/deazl/issues)

</div>

## 🚀 About Deazl

Deazl is a community-driven price comparison platform that helps you save money on your groceries and daily purchases. Compare prices across different stores, create collaborative shopping lists, and track price trends - all completely free and open source.

## 🔄 Release Management

This project uses an automated release system with semantic versioning:

### 🎯 Quick Commands

```bash
# Check release status
make status

# Promote staging to production
make promote

# Deploy to staging
make deploy

# View unreleased changes
make changelog
```

### 📋 Workflow Overview

1. **Development** → Feature branches merged to `dev`
2. **Staging** → Auto pre-releases on `dev` (e.g., `1.2.0-beta.1`)
3. **Production** → Promote stable releases to `master`

See [Release Documentation](docs/RELEASE.md) for detailed workflow information.

### ✨ Key Features

- **🔍 Real-time Price Comparison**: Compare prices between different stores instantly
- **📱 Barcode Scanner**: Quickly add products by scanning barcodes
- **📋 Smart Shopping Lists**: Create, share, and collaborate on shopping lists in real-time
- **👥 Collaboration**: Share lists with family and friends with role-based permissions
- **📊 Price History**: Track price changes over time with detailed charts
- **🔔 Price Alerts**: Get notified when prices drop
- **🌍 Community-Driven**: Prices verified and updated by an active community
- **📱 PWA Support**: Install as a mobile app for the best experience
- **🌐 Multi-language**: Available in English and French
- **🎨 Modern UI**: Beautiful, responsive interface with dark/light mode

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [HeroUI](https://www.heroui.com/)
- **State Management**: React Server Components + Server Actions
- **Internationalization**: [Lingui](https://lingui.dev/)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)

### Backend
- **Database**: [PostgreSQL](https://postgresql.org/) with [Prisma ORM](https://prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **File Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Search**: [Algolia](https://www.algolia.com/)
- **Deployment**: [Vercel](https://vercel.com/)

### Architecture
- **Pattern**: Clean Architecture with Domain-Driven Design (DDD)
- **Repository Pattern**: Separated domain logic from infrastructure
- **CQRS**: Command Query Responsibility Segregation
- **API**: RESTful with OpenAPI documentation

### Development Tools
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Testing**: [Jest](https://jestjs.io/) with Testing Library
- **Type Safety**: Strict TypeScript with Zod validation
- **Database**: Prisma migrations and type-safe queries
- **CI/CD**: GitHub Actions with automated testing and deployment

## 🏗️ Architecture Overview

The application follows Clean Architecture principles with Domain-Driven Design:

```
src/
├── applications/           # Application layer (use cases)
│   ├── ShoppingLists/     # Shopping list domain
│   │   ├── Api/           # Server actions (controllers)
│   │   ├── Application/   # Application services
│   │   ├── Domain/        # Domain entities, value objects, services
│   │   ├── Infrastructure/# Repositories, mappers
│   │   └── Ui/           # React components
│   ├── Prices/           # Price comparison domain
│   ├── Authentication/   # User authentication
│   └── ...
├── components/           # Shared UI components
├── libraries/           # External service integrations
└── views/              # Page-level components
```

### Key Architectural Decisions

- **Repository Pattern**: Clean separation between domain logic and data access
- **Domain Services**: Business logic encapsulated in domain services
- **Application Services**: Orchestrate use cases and handle cross-cutting concerns
- **Value Objects**: Ensure data integrity with typed value objects
- **Entity Aggregates**: Maintain consistency within domain boundaries

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ and **yarn**
- **PostgreSQL** database
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Deazl-Comparator/deazl.git
   cd pcomparator
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/deazl"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3001"
   
   # OAuth providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # External APIs
   ALGOLIA_APP_ID="your-algolia-app-id"
   ALGOLIA_API_KEY="your-algolia-api-key"
   OPEN_FOOD_FACT_API_ENDPOINT="https://world.openfoodfacts.org"
   ```

4. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with Turbo |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn test` | Run test suite |
| `yarn lint` | Lint code with Biome |
| `yarn format:check` | Check code formatting |
| `yarn typescript:check` | Type check without emitting |
| `yarn translation:extract` | Extract translation strings |
| `yarn storybook` | Start Storybook development |

## 🏢 Core Features

### 📋 Shopping Lists
- **Create & Manage**: Organize your shopping with smart lists
- **Real-time Collaboration**: Share with family/friends with role-based access
- **Quick Add**: Use natural language input (e.g., "2kg apples €3.50")
- **Progress Tracking**: Monitor completion status and spending
- **Barcode Integration**: Scan products directly into lists

### 💰 Price Comparison
- **Multi-store Comparison**: Compare prices across different retailers
- **Historical Data**: 30-day price history with trend analysis
- **Community Verified**: Prices validated by the user community
- **Price Alerts**: Get notified when products go on sale
- **Proof System**: Photo verification for price accuracy

### 🤝 Community Features
- **Crowdsourced Data**: Community-maintained price database
- **Product Database**: 10,000+ products with detailed information
- **Store Network**: Major French retailers and local stores
- **User Contributions**: Easy price submission with verification

### 📱 Mobile Experience
- **Progressive Web App**: Install on mobile devices
- **Offline Support**: Basic functionality works offline
- **Camera Integration**: Barcode scanning and price proof photos
- **Touch Optimized**: Designed for mobile-first experience

## 🗂️ Database Schema

### Core Entities

```sql
-- Users and Authentication
User (id, email, name, phone, image)
Account (provider, providerAccountId, userId)
Session (sessionToken, userId, expires)

-- Product Catalog
Product (id, barcode, name, description, categoryId, brandId)
Category (id, name, description, parentCategoryId)
Brand (id, name, description, websiteUrl)
Store (id, name, location, websiteUrl)

-- Price Tracking
Price (id, productId, storeId, amount, currency, dateRecorded, proofImage)

-- Shopping Lists
ShoppingList (id, name, description, userId, isPublic, shareToken)
ShoppingListItem (id, shoppingListId, productId, quantity, unit, customName, price, isCompleted)
ShoppingListCollaborator (id, listId, userId, role)
```

## 🔒 Authentication & Authorization

### Supported Providers
- **Google OAuth**: Quick social login

### Permission System
- **OWNER**: Full control over shopping lists
- **EDITOR**: Can modify list items and settings
- **VIEWER**: Read-only access to shared lists

### Security Features
- **Session Management**: Secure JWT-based sessions
- **CSRF Protection**: Built-in security measures
- **Rate Limiting**: API abuse prevention
- **Data Validation**: Comprehensive input sanitization

## 🌍 Internationalization

Deazl supports multiple languages using Lingui:

- **English** (en): Primary language
- **French** (fr): Fully localized

### Adding New Languages

1. **Extract strings**:
   ```bash
   yarn translation:extract
   ```

2. **Add new locale** in `lingui.config.ts`

3. **Translate strings** in `src/translations/messages/{locale}.po`

4. **Compile translations**:
   ```bash
   yarn compile
   ```

## 🧪 Testing

### Test Structure
```bash
# Unit Tests
yarn test

# Component Tests
yarn test -- --testPathPattern=components

# Integration Tests
yarn test -- --testPathPattern=integration
```

### Testing Strategy
- **Unit Tests**: Domain logic and utilities
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React component behavior
- **E2E Tests**: Critical user journeys

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure environment variables**
3. **Deploy**: Automatic deployment on push to main

### Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"

# Storage
BLOB_READ_WRITE_TOKEN="vercel-blob-token"

# Search
ALGOLIA_APP_ID="production-app-id"
ALGOLIA_API_KEY="production-key"
```

### Self-Hosting

```bash
# Build application
yarn build

# Start production server
yarn start
```

## 📊 Performance & Monitoring

### Optimization Features
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Automatic image compression and lazy loading
- **Code Splitting**: Bundle optimization with Next.js
- **Caching**: Aggressive caching strategies
- **PWA**: Offline functionality and app-like experience

### Monitoring
- **Error Tracking**: Built-in error boundaries
- **Performance Metrics**: Core Web Vitals monitoring
- **Database Monitoring**: Query performance tracking
- **User Analytics**: Privacy-friendly usage analytics

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `yarn test`
6. **Lint your code**: `yarn lint`
7. **Commit your changes**: `git commit -m 'Add amazing feature'`
8. **Push to the branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Coding Standards

- **TypeScript**: Strict type checking enabled
- **Biome**: Consistent code formatting and linting
- **Conventional Commits**: Semantic commit messages
- **Clean Architecture**: Follow established patterns
- **Test Coverage**: Maintain test coverage above 80%

### Areas for Contribution

- 🐛 **Bug Fixes**: Help us squash bugs
- ✨ **New Features**: Implement requested features
- 🌍 **Translations**: Add support for new languages
- 📚 **Documentation**: Improve docs and guides
- 🎨 **UI/UX**: Enhance user experience
- ⚡ **Performance**: Optimize application performance
- 🧪 **Testing**: Improve test coverage

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open Food Facts**: Product database and API
- **Community Contributors**: Thanks to all who contribute prices and feedback
- **Open Source Libraries**: Built on the shoulders of giants

## 📞 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Deazl-Comparator/deazl/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Deazl-Comparator/deazl/discussions)
- **📧 Contact**: [clement.muth@deazl.fr](mailto:clement.muth@deazl.fr)
- **🐦 Updates**: Follow us on social media

## 📈 Project Status

- **Version**: 4.9.0
- **Status**: Active Development
- **Users**: 2+ active users
- **Products**: 10+ tracked products
- **Stores**: Major French retailers supported

---

<div align="center">

**Made with ❤️ by the Deazl community**

*Help us make price comparison accessible to everyone*

[⭐ Star this repository](https://github.com/Deazl-Comparator/deazl) • [🔄 Share with friends](https://deazl.fr/en)

</div>
