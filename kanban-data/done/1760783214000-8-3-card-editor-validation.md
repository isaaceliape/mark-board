---
title: 8.3 Card Editor Validation
created: '2025-10-18T10:53:34.000Z'
updated: '2025-10-18T10:53:34.000Z'
tags:
  - user-story
  - phase-8
  - validation
  - ui-ux
---

# 8.3 Card Editor Validation

As a user, I want proper validation on card editor fields so that I can ensure data quality and receive helpful feedback when entering invalid information.

## Acceptance Criteria

- **Title validation**: Required field, cannot be empty after trimming whitespace
- **Content validation**: Optional field, but should trim whitespace
- **Tags validation**: Comma-separated values, each tag should be non-empty after trimming, no duplicate tags
- **Assignee validation**: Optional field, should trim whitespace, perhaps validate as email or username format
- **Due Date validation**: Optional field, must be a valid date, should not be in the past if set
- **Error display**: Show validation errors inline below each field instead of using alert dialogs
- **Save prevention**: Disable save button or prevent saving when validation fails
- **Real-time validation**: Provide immediate feedback as user types (optional enhancement)

## Implementation Notes

- Replace the current `alert('Title is required')` with proper error state management
- Add error state for each field
- Use red border/highlighting for invalid fields
- Display error messages below invalid fields
- Consider using a validation library or custom validation functions
