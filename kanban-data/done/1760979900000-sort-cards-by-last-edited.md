---
title: Sort Cards by Last Edited
created: 2025-01-20T20:05:00Z
updated: 2025-01-20T20:05:00Z
tags: [feature, ui, ux, sorting]
assignee:
dueDate:
---

# Sort Cards by Last Edited

As a user, I want cards to be sorted by last edited date so that I can quickly find and access the cards I've been working on most recently.

## User Story

Currently, cards are displayed in a fixed order. This feature will sort cards by their `updated` timestamp in descending order (most recently edited first), making it easier to find cards that were recently modified.

## Acceptance Criteria

- Cards in each column are sorted by `updated` timestamp (newest first)
- Sorting updates automatically when a card is edited
- Sorting persists across page refreshes
- Newly created cards appear at the top
- Moving cards between columns maintains sort order within each column
- Performance remains smooth with large numbers of cards
- Sort order is consistent across all three columns (Backlog, In Progress, Done)

## Implementation Details

1. Update board store to sort cards by `updated` field when loading
2. Ensure card updates modify the `updated` timestamp
3. Update card creation to set initial `updated` timestamp
4. Modify rendering logic to maintain sorted order
5. Consider adding a sort configuration option for future extensibility

## Dependencies

- Card metadata must include `updated` timestamp (already present)
- File operations must update card frontmatter timestamps

## Design Notes

- This changes the default card ordering behavior
- Cards should re-sort automatically after edits without requiring page refresh
- Consider whether drag-and-drop should override sort order (or revert on next edit)

## Testing Considerations

- Create multiple cards and edit them in different orders
- Verify sorting after card edits
- Verify sorting after page refresh
- Test with cards that have identical timestamps
- Test performance with 50+ cards per column
