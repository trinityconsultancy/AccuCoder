# AccuCoder Testing Guide

## Running Tests

### Unit Tests
```bash
pnpm test                # Run all tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage report
```

### Test Structure

```
__tests__/
├── setup.test.ts       # Basic test setup
├── components/         # Component tests
├── api/               # API endpoint tests
└── integration/       # Integration tests
```

## Writing Tests

### Component Testing Example
```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### API Testing Example
```typescript
import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'

describe('Login API', () => {
  it('should return 200 for valid credentials', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(200)
  })
})
```

## Test Coverage Goals

- Components: 80%+
- API Routes: 90%+
- Utilities: 95%+
- Overall: 85%+

## CI/CD Integration

Tests will automatically run on:
- Pull requests
- Push to main branch
- Before deployment

## Best Practices

1. Test user behavior, not implementation details
2. Use meaningful test descriptions
3. Keep tests isolated and independent
4. Mock external dependencies
5. Test edge cases and error handling

## Next Steps

1. Install test dependencies: `pnpm install`
2. Write component tests
3. Write API tests
4. Add integration tests
5. Set up CI/CD pipeline
