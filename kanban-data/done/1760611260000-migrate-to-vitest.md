---
title: 7.4 Migrate Tests to Vitest
created: 2025-10-18T12:00:00Z
updated: 2025-10-18T12:00:00Z
tags: [user-story, phase-7, tests, infrastructure]
assignee:
dueDate:
---

# 7.4 Migrate Tests to Vitest

As a developer, I want reliable test execution with Bun compatibility so that I can run tests efficiently without Jest/Bun environment conflicts.

## Acceptance Criteria

- Replace Jest with Vitest as the test runner
- Update all test files to use Vitest APIs (vi instead of jest)
- Configure Vitest for React component testing with jsdom
- Ensure all existing tests pass with the new setup
- Update package.json scripts to use Vitest commands
- Remove Jest dependencies and add Vitest dependencies
- Update CI/CD configuration if needed

## Notes

- Vitest provides better Bun integration and faster test execution
- Keep existing test structure and coverage
- Focus on component tests that were failing due to Jest/Bun compatibility
- Ensure proper mocking of browser APIs (window, document, localStorage)
- Maintain React Testing Library integration
