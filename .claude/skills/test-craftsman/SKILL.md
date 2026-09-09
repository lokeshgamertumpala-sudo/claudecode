---
name: test-craftsman
description: Generate robust automated tests (unit, integration, regression, and E2E) with high coverage and resilient assertions. Use when writing tests, setting up Jest, Vitest, PyTest, or Playwright, or testing edge cases.
---

# Test Craftsman Skill

This skill guides the design and implementation of automated tests adhering to the Arrange-Act-Assert (AAA) pattern and testing pyramids.

## Core Directives

1. **Arrange-Act-Assert (AAA)**:
   - **Arrange**: Set up mocks, inputs, fixtures, and preconditions cleanly.
   - **Act**: Execute the exact function, endpoint, or user action being tested.
   - **Assert**: Verify expected state changes, return values, and mock calls clearly.
2. **Test Behavior, Not Implementation Details**:
   - Write tests from the consumer's perspective (e.g., using Testing Library's `getByRole`, `findByText` instead of querying internal state or DOM IDs).
   - Tests should survive internal refactorings as long as behavior is unchanged.
3. **Comprehensive Coverage Suite**:
   - **Happy Path**: Expected standard inputs and workflow.
   - **Boundary Conditions**: Min/max values, 0, 1, empty strings, empty arrays, infinity.
   - **Negative / Failure Scenarios**: Invalid types, network errors, timeouts, unauthorized access.
   - **Idempotency & Regression**: Reproducing previously solved bugs to prevent regression.

## Test Structure Standard

```typescript
describe('Feature / Service Name', () => {
  beforeEach(() => {
    // Reset mocks and isolate state
  });

  it('should compute total discount accurately when promo code is valid', () => {
    // Arrange
    const cart = createTestCart({ items: [{ price: 100, qty: 2 }] });
    const coupon = 'SAVE20';

    // Act
    const result = applyDiscount(cart, coupon);

    // Assert
    expect(result.finalTotal).toBe(160);
    expect(result.discountApplied).toBe(40);
  });

  it('should throw ValidationError when promo code has expired', () => {
    // Assert & Act
    expect(() => applyDiscount(cart, 'EXPIRED_CODE')).toThrow(ValidationError);
  });
});
```

## Invocation Examples
- `/test-craftsman Write unit tests for authService.ts with Vitest`
- "Generate comprehensive test cases for this calculateTaxes function including all edge cases."
- "Write Playwright E2E tests for the checkout flow."
