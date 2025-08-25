# E2E Tests for SDU Dormitory Management System

This directory contains comprehensive end-to-end tests for the SDU Dormitory Management System, aligned with the current project requirements and business rules.

## Test Structure

### Core Test Files

#### `test-utils.ts`
- **Purpose**: Centralized test utilities and common functions
- **Features**:
  - Standardized login/logout functions for different user roles
  - Common selectors for UI elements
  - Business rule validation utilities
  - Test data generators
  - Internationalization testing helpers

#### `auth.spec.ts`
- **Purpose**: Authentication flow testing
- **Coverage**:
  - Login functionality for all user roles (Superadmin, Admin, Student)
  - Registration process
  - Password reset functionality
  - Access control for protected routes

#### `role-based-access.spec.ts`
- **Purpose**: Role-based access control validation
- **Coverage**:
  - Superadmin access to all modules
  - Admin access to management modules
  - Student access to self-service modules
  - Guest house access control
  - Cross-role access validation

#### `business-rules.spec.ts`
- **Purpose**: Business rule enforcement testing
- **Coverage**:
  - Student dormitory access based on payment status
  - Staff reserved beds management
  - Payment status integration with access control

#### `payment-access-rules.spec.ts`
- **Purpose**: Payment and access rule validation
- **Coverage**:
  - Semester payment tracking
  - Dormitory access rules
  - Student self-service features
  - Payment processing (internal only)
  - Access control integration

#### `guest-house-management.spec.ts`
- **Purpose**: Guest house functionality testing
- **Coverage**:
  - Guest registration and management
  - Room management for guests
  - Guest house CRUD operations
  - Access control for guest house
  - Integration with other systems

#### `external-integration-validation.spec.ts`
- **Purpose**: Validation that external integrations are NOT implemented
- **Coverage**:
  - Payment system integration validation
  - Security & access system validation
  - Student registration integration validation
  - Dashboard integration validation
  - Configuration settings validation

#### `i18n.spec.ts`
- **Purpose**: Internationalization testing
- **Coverage**:
  - Language switching functionality
  - Translation support for all required languages (EN, KK, RU)
  - Language preference persistence
  - Missing translation handling

### Legacy Test Files (Updated)

The following existing test files have been updated to align with current project requirements:

- `student-crud.spec.ts` - Student management CRUD operations
- `admin-crud.spec.ts` - Admin management CRUD operations
- `room-crud.spec.ts` - Room management CRUD operations
- `bed-crud.spec.ts` - Bed management CRUD operations
- `roomtype-crud.spec.ts` - Room type management CRUD operations
- `guest-crud.spec.ts` - Guest management CRUD operations
- `payments-crud.spec.ts` - Payment management CRUD operations
- `accounting.spec.ts` - Accounting functionality testing
- `messaging.spec.ts` - Messaging system testing
- `settings.spec.ts` - System settings testing
- `navigation.spec.ts` - Navigation and routing testing
- `accessibility.spec.ts` - Accessibility compliance testing

## Test Configuration

### Environment Setup

The tests use a flexible environment configuration that works with or without a `.env.testing` file:

```typescript
// Default test environment variables (if .env.testing doesn't exist)
VITE_API_BASE_URL=http://localhost:8000/api
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
STUDENT_EMAIL=student@example.com
STUDENT_PASSWORD=password
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=password
```

### Test Users

The tests use three main user roles as defined in the project requirements:

1. **Superadmin**: Full system access
2. **Admin**: Management access (students, rooms, payments, etc.)
3. **Student**: Self-service access only

## Business Rules Alignment

### Payment Rules
- ✅ Semester-based payment tracking
- ✅ Internal payment processing only
- ❌ No external payment gateway integration
- ❌ No Kaspi QR payment integration

### Access Control Rules
- ✅ Manual dormitory access verification
- ✅ Payment status-based access control
- ❌ No physical card access system integration
- ❌ No external authentication systems

### Role-Based Access
- ✅ Superadmin: All modules access
- ✅ Admin: Management modules access
- ✅ Student: Self-service modules only
- ✅ Guest House: Guest management access

### Internationalization
- ✅ Frontend-only translation approach
- ✅ JSON-based translation files
- ✅ Support for EN, KK, RU languages
- ✅ Context-specific translation keys

## External Service Integration Status

### NOT Implemented (As Per Requirements)
- ❌ Kaspi QR payment integration
- ❌ External payment gateways
- ❌ Physical card access systems
- ❌ External authentication providers
- ❌ 1C accounting system integration

### Internal Systems Only
- ✅ Laravel Sanctum authentication
- ✅ Internal payment tracking
- ✅ Manual access control
- ✅ Internal messaging system
- ✅ Internal reporting

## Running Tests

### Prerequisites
1. Frontend development server running on `http://localhost:3000`
2. Backend API server running on `http://localhost:8000`
3. Test database with appropriate test data

### Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/e2e/auth.spec.ts

# Run tests with specific browser
npm run test:e2e -- --project=chrome

# Run tests with debug output
npm run test:e2e -- --debug

# Run tests and generate HTML report
npm run test:e2e -- --reporter=html
```

### Test Execution Strategy

1. **Parallel Execution**: Tests are designed to run in parallel where possible
2. **Isolation**: Each test is isolated and doesn't depend on other tests
3. **Retry Logic**: Failed tests are retried once on CI, twice locally
4. **Timeout Handling**: Appropriate timeouts for network operations and UI interactions

## Test Data Management

### Test Data Generation
- Unique email addresses for each test run
- Unique names and identifiers
- Proper test data cleanup

### Database State
- Tests assume a clean database state
- No test data dependencies between test files
- Proper setup and teardown for each test

## Accessibility Testing

The tests include comprehensive accessibility validation:

- ✅ ARIA attribute testing
- ✅ Keyboard navigation testing
- ✅ Screen reader compatibility
- ✅ Color contrast validation
- ✅ Focus management testing

## Responsive Testing

Tests validate responsive behavior across different screen sizes:

- ✅ Mobile device compatibility
- ✅ Tablet device compatibility
- ✅ Desktop device compatibility
- ✅ Touch interaction testing

## Continuous Integration

### CI/CD Integration
- Tests run automatically on pull requests
- Fail-fast strategy for critical path tests
- Comprehensive reporting for test results
- Integration with code coverage reporting

### Test Reporting
- HTML test reports for detailed analysis
- Console output for quick feedback
- Screenshot capture on test failures
- Video recording for debugging

## Maintenance and Updates

### When to Update Tests
- New features added to the application
- Business rules changed
- UI/UX modifications
- API endpoint changes
- Role-based access modifications

### Test Maintenance Best Practices
- Keep tests focused and atomic
- Use descriptive test names
- Maintain test data consistency
- Regular review of test coverage
- Update selectors when UI changes

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Check if development servers are running
   - Verify network connectivity
   - Increase timeout values if needed

2. **Selector Failures**
   - Update selectors in `test-utils.ts`
   - Check for UI changes
   - Verify element visibility

3. **Authentication Issues**
   - Verify test user credentials
   - Check backend authentication service
   - Ensure proper test data setup

4. **Environment Issues**
   - Verify `.env.testing` configuration
   - Check API base URL settings
   - Ensure proper test environment setup

### Debug Mode

Run tests in debug mode for detailed troubleshooting:

```bash
npm run test:e2e -- --debug
```

This will:
- Show detailed console output
- Capture screenshots on failures
- Record video of test execution
- Provide step-by-step debugging information

## Contributing

When adding new tests:

1. Follow the existing test structure and patterns
2. Use the centralized utilities in `test-utils.ts`
3. Align with current business rules and requirements
4. Ensure proper test isolation
5. Add appropriate documentation
6. Update this README if needed

## Future Considerations

The test suite is designed to accommodate future enhancements:

- External service integration testing (when implemented)
- Additional role-based access scenarios
- Enhanced internationalization features
- Performance testing integration
- Security testing expansion 