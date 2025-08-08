# SDU Dormitory Management Frontend

This is the frontend for the SDU Dormitory Management System, built with Vue 3, TypeScript, Tailwind CSS, and Pinia. It provides a comprehensive admin interface for managing students, guests, rooms, dormitories, payments, and more.

## 🚀 Features

### Core Management
- **Authentication & Authorization**: Secure login with role-based access control (admin, student, guest)
- **Student Management**: Complete CRUD operations for student profiles with comprehensive data tracking
- **Guest Management**: Guest house registration and management system
- **Room & Dormitory Management**: Room types, room allocation, bed management with staff reservations
- **Payment System**: Semester payment tracking, accounting, and financial management
- **Messaging System**: Internal communication platform for announcements and notifications

### User Experience
- **Responsive Design**: Modern, mobile-first interface built with Tailwind CSS
- **Multi-language Support**: English, Kazakh, and Russian localization
- **Accessibility (a11y)**: WCAG 2.1 compliant with keyboard navigation, screen reader support
- **Real-time Updates**: Dynamic data loading and state management with Pinia
- **Form Validation**: Comprehensive client-side and server-side validation

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Component Library**: Reusable C* components for consistent UI/UX
- **Testing**: Comprehensive unit and E2E test coverage (Vitest + Playwright)
- **Internationalization**: Vue I18n with JSON-based translations
- **State Management**: Pinia stores for centralized state management

## 📁 Project Structure

```
src/
├── assets/           # Images and static assets
├── components/       # Reusable Vue components (CButton, CModal, CInput, etc.)
├── models/           # TypeScript interfaces and type definitions
├── pages/            # Main page components (Students, Guests, Payments, etc.)
├── router/           # Vue Router configuration with route guards
├── services/         # API services and business logic
├── stores/           # Pinia stores for state management
├── i18n/             # Localization files (en.json, kk.json, ru.json)
├── utils/            # Utility functions and helpers
├── index.css         # Tailwind CSS and custom styles
└── main.ts           # Application entry point
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optional, for containerized development)

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="SDU Dormitory Management"
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Generate coverage report
npm run test:unit:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with browser UI (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

**E2E Test Requirements:**
- Backend server must be running on `http://localhost:8000`
- Frontend development server must be running on `http://localhost:5173`
- Database should be seeded with test data

**E2E Test Coverage:**
- User authentication flows (login, logout, password reset)
- Admin profile management (CRUD operations)
- Student profile management (registration, editing, validation)
- Guest management workflows
- Navigation and routing (sidebar, breadcrumbs)
- Form interactions and validations
- Payment management workflows
- Dormitory and room management
- Messaging system
- Accessibility testing (keyboard navigation, screen readers)

### Test Configuration

Create `.env.testing` for E2E tests:

```env
ADMIN_EMAIL=admin@sdu.edu.kz
ADMIN_PASSWORD=supersecret
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🐳 Docker Setup

This project uses environment-based Docker builds controlled by the `APP_ENV` variable in your `.env` file. **Only one `docker-compose.yml` file is needed** - the environment is automatically detected from your `.env` file.

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository

### Quick Start

#### Local Development
```bash
# Copy environment file for local development
cp env.local .env

# Edit .env file and set:
APP_ENV=local
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8000/api

# Build and start containers
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
```

#### Production
```bash
# Copy environment file for production
cp env.production .env

# Edit .env file and set:
APP_ENV=production
NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api

# Build and start containers
docker-compose up -d

# Access the application
# Frontend: http://localhost:80
```

### Environment Configuration

The system automatically detects your environment from the `APP_ENV` variable in your `.env` file:

#### Local Development (`APP_ENV=local`)
- **Container Target**: `local` (development-friendly)
- **Hot Reload**: Code changes reflect immediately
- **Volume Mounts**: Source code mounted for live editing
- **Development Tools**: vim, htop included
- **Port**: 5173
- **Debugging**: Full debugging enabled

#### Production (`APP_ENV=production`)
- **Container Target**: `production` (optimized)
- **Security**: Enhanced security headers and CSP protection
- **Performance**: Optimized builds with compression
- **Caching**: Long-term caching for static assets
- **Port**: 80
- **Compression**: Gzip compression enabled

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Access container shell
docker-compose exec frontend sh

# Run tests
docker-compose exec frontend npm run test:unit

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build -d
```

### Environment Variables

#### Required Variables
```env
APP_ENV=local                    # Environment: local or production
NODE_ENV=development             # Node environment: development or production
VITE_API_BASE_URL=http://localhost:8000/api  # API base URL
```

#### Docker-Specific Variables
```env
FRONTEND_PORT=5173               # Frontend port (5173 for local, 80 for production)
CONTAINER_PORT=5173              # Container port (5173 for local, 80 for production)
VOLUME_MOUNT=.:/app              # Volume mount (.:/app for local, /dev/null:/dev/null for production)
```

### Services

- **frontend**: Vue.js application (environment-based build)

### Troubleshooting

#### Common Issues
1. **Port conflicts**: Ensure ports 5173 (local) or 80 (production) are available
2. **Build failures**: Clear Docker cache with `docker system prune -a`
3. **API connection**: Check VITE_API_BASE_URL in .env
4. **Memory issues**: Increase Docker memory limit to 4GB+

#### Debug Commands
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build -d

# Clean up
docker-compose down -v
docker system prune -f
```

## 🏗️ Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Customization

### Theme & Styling

- **Colors**: SDU brand colors defined in `/src/index.css`
- **Components**: Custom C* components in `/src/components/`
- **Typography**: Inter font family with responsive sizing
- **Spacing**: Tailwind CSS utility classes for consistent spacing

### Internationalization

Edit translation files in `/src/i18n/`:
- `en.json` - English translations
- `kk.json` - Kazakh translations  
- `ru.json` - Russian translations

### Component Library

All UI components follow the C* naming convention:
- `CButton` - Buttons with variants (primary, secondary, danger)
- `CInput` - Form inputs with validation
- `CModal` - Modal dialogs with accessibility features
- `CTable` - Data tables with sorting and filtering
- `CSelect` - Dropdown selects with search
- `CToast` - Notification toasts
- `CSidebar` - Navigation sidebar

## 🔧 Development Guidelines

### Code Style

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

### Component Development

1. **Use C* components**: Always use existing C* components for consistency
2. **TypeScript**: Write all components in TypeScript with proper interfaces
3. **Testing**: Write unit tests for all components (TDD approach)
4. **Accessibility**: Ensure WCAG 2.1 compliance with proper ARIA attributes
5. **Internationalization**: Use `t()` function for all user-facing text

### State Management

- **Pinia Stores**: Use Pinia for global state management
- **Component State**: Use Vue 3 Composition API for local state
- **API Integration**: Centralize API calls in service files

### Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure a11y compliance

## 📚 API Integration

### Authentication

```typescript
// Login
POST /api/login
{
  "email": "user@example.com",
  "password": "password"
}

// Get user profile
GET /api/users/profile

// Update profile
PUT /api/users/profile
```

### Student Management

```typescript
// Get students with filters
GET /api/students?faculty=engineering&status=active

// Create student
POST /api/students
{
  "iin": "123456789012",
  "name": "John Doe",
  "email": "john@example.com",
  // ... other fields
}
```

### Payment Management

```typescript
// Get payments with filters
GET /api/payments?status=completed&date_from=2024-01-01

// Create payment
POST /api/payments
{
  "user_id": 1,
  "amount": 150000,
  "semester": "fall",
  "year": 2024
}
```

## 🔒 Security Features

- **Role-based Access Control**: Different permissions for admin, student, guest
- **Route Guards**: Protected routes with authentication checks
- **Input Validation**: Client-side and server-side validation
- **CSRF Protection**: Built-in CSRF token handling
- **Secure Headers**: Security headers configured

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG 2.1 AA compliant color ratios
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML structure for assistive technologies

## 🚀 Performance Optimization

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Optimized image loading
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Proper caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Write tests first (TDD approach)
4. Implement the feature
5. Ensure all tests pass
6. Commit your changes (`git commit -am 'Add some feature'`)
7. Push to the branch (`git push origin feature/YourFeature`)
8. Create a new Pull Request

### Code Review Checklist

- [ ] Does this follow all conventions from `design guidelines.md`?
- [ ] Are all business rules enforced and tested?
- [ ] Is the code accessible (a11y compliant)?
- [ ] Are there comprehensive tests (unit + E2E)?
- [ ] Is the code properly documented?
- [ ] Does it follow TypeScript best practices?

## 📄 License

This project is private and for SDU internal use only.

---

**SDU Dormitory Management System**  
Contact: [info@sdu.edu.kz](mailto:info@sdu.edu.kz)

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration allows frontend origin
2. **Authentication Issues**: Check API base URL and credentials
3. **Test Failures**: Ensure both frontend and backend servers are running
4. **Build Errors**: Check Node.js version and dependency compatibility

### Development Tips

- Use Vue DevTools for debugging
- Check browser console for API errors
- Use TypeScript strict mode for better type safety
- Run tests frequently during development
- Follow the established component patterns