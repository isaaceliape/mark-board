# US 7.5: Fix React Component Tests for Bun Test Runner

## Description

After migrating from Vitest to Bun's built-in test runner, React component tests are failing due to differences in Bun's testing API and environment setup. The tests need to be updated to work with Bun's mocking system and browser environment simulation.

## Acceptance Criteria

- [ ] All React component tests pass with `bun test`
- [ ] ThemeToggle component tests work correctly
- [ ] Card component tests work correctly
- [ ] CardEditor component tests work correctly
- [ ] Column component tests work correctly
- [ ] Mocking of external dependencies (@dnd-kit, etc.) works properly
- [ ] Browser globals (window, document) are properly available
- [ ] Test coverage maintained or improved

## Technical Details

### Current Issues

1. **Mocking API**: `jest.mock()` and `jest.fn()` are not available in Bun
2. **Browser Globals**: `window` and `document` are not available in Bun's test environment
3. **External Dependencies**: @dnd-kit and other libraries need proper mocking
4. **Setup**: `setupTests.ts` needs Bun-compatible configuration

### Required Changes

#### 1. Update Test Setup (`src/setupTests.ts`)

- Replace Jest-specific mocking with Bun-compatible alternatives
- Set up browser globals for React Testing Library
- Configure Bun's test environment for DOM testing

#### 2. Update Component Test Files

- Replace `jest.mock()` with Bun's `mock()` function
- Replace `jest.fn()` with Bun's equivalent
- Update import statements for Bun's test APIs
- Fix any Jest-specific assertions

#### 3. Mock External Dependencies

- Create Bun-compatible mocks for @dnd-kit libraries
- Mock browser APIs (localStorage, matchMedia, etc.)
- Ensure React Testing Library works properly

#### 4. Environment Configuration

- Configure Bun's test runner for DOM environment
- Set up proper globals for React components
- Ensure CSS and asset loading works in tests

### Implementation Plan

#### Phase 1: Environment Setup

1. Update `src/setupTests.ts` for Bun compatibility
2. Configure browser globals (window, document, navigator)
3. Set up React Testing Library environment
4. Test basic React component rendering

#### Phase 2: Mocking System

1. Replace Jest mocks with Bun's `mock()` API
2. Create mock implementations for external dependencies
3. Update all `jest.fn()` calls to Bun equivalents
4. Test mocking functionality

#### Phase 3: Component Test Updates

1. Update ThemeToggle tests
2. Update Card component tests
3. Update CardEditor tests
4. Update Column component tests
5. Fix any remaining compatibility issues

#### Phase 4: Validation

1. Run full test suite with `bun test`
2. Ensure all tests pass
3. Verify test coverage
4. Update documentation

### Dependencies

- Bun's test runner (already installed)
- React Testing Library (already installed)
- @testing-library/jest-dom (may need Bun-compatible version)

### Testing Strategy

- Run tests individually during development: `bun test src/components/__tests__/ThemeToggle.test.tsx`
- Run full test suite: `bun test`
- Watch mode for development: `bun test --watch`
- Coverage reporting: `bun test --coverage`

### Risk Assessment

- **Low Risk**: Bun's test runner is Jest-compatible, so most changes are API updates
- **Medium Risk**: Browser environment setup might require significant changes
- **Low Risk**: Mocking system changes are mostly find-and-replace operations

### Success Metrics

- All React component tests pass (0 failures)
- Test execution time improved (Bun is faster than Vitest)
- No regressions in existing functionality
- Maintainable test code that follows Bun best practices
