# User Story: Live Reload of Kanban Data (Hot-Reload-like behavior)

## Summary

As a user, I want the app to automatically reflect any changes to files under `kanban-data/**` (adds, edits, deletes, moves) without manually refreshing the browser, so that the board stays in sync with my filesystem in near real-time.

## Motivation

- Improve authoring flow when editing Markdown cards with external editors.
- Keep the board in sync when new cards are created, moved across columns, or removed from disk.
- Reduce friction and minimize context switching (no manual reloads).

## Scope

- Watch `kanban-data/` recursively, including `backlog/`, `in-progress/`, and `done/` folders and any subfolders.
- Respond to file events for `*.md` (and ignore non-Markdown files unless explicitly configured later).
- Update the in-memory board state and UI to reflect changes quickly.

## Out of Scope (for this story)

- Bundler-level HMR for application code.
- Non-Markdown content parsing/rendering.
- Remote sync; this is local filesystem watching only.

## Acceptance Criteria

- Editing a `*.md` file updates the corresponding card’s content in the UI within ~1s.
- Creating a new `*.md` file in any column directory adds a card to that column.
- Deleting a `*.md` file removes the corresponding card from the board.
- Moving or renaming a `*.md` file updates the card and its column when the path change implies a column change.
- The UI does not full-refresh; only affected cards/columns update.
- Burst updates are debounced/coalesced to avoid UI thrash.
- Errors (permission issues, parse errors) display a non-blocking notice without breaking the app.
- Works on macOS by default; implement a portable path for Linux/Windows as feasible or provide a polling fallback.

## Implementation Notes

- Extend or replace `hooks/useFileWatcher.ts` to support directory-recursive watching and map events to board updates.
- Use existing utilities in `src/utils/fileOperations.ts`, `src/utils/fileSystemAccess.ts`, and `src/utils/markdownParser.ts` where possible.
- Normalize events: ADD, CHANGE, DELETE, MOVE/RENAME; derive card identity from file path.
- Debounce with a short window (e.g., 150–300ms) and batch updates to the store for smoother UI.
- Ensure idempotent handling (e.g., multiple rapid change events for same file).
- Add an optional feature flag (e.g., `VITE_ENABLE_FS_WATCH=1`) to toggle behavior if needed.

## Tasks

1. Enhance `useFileWatcher` to watch `kanban-data/**` recursively and emit normalized events.
2. Map file events to board operations in `stores/boardStore.ts` (add/update/remove/move card).
3. Implement debounce/batching and ensure UI only rerenders affected slices.
4. Handle error/reporting path with user-friendly messages.
5. Add minimal tests (unit/integration) where current patterns allow.
6. Update `README.md` or `SPECIFICATION.md` to document behavior and any env flags.

## Risks & Constraints

- Cross-platform file watching differences; consider Node watcher or polling fallback.
- Large directories may generate high event volume; ensure efficient batching.
- Avoid blocking the main thread; keep parsing lightweight or offload if needed.

## Estimate

- 2–3 days (medium complexity), depending on cross-platform testing.
