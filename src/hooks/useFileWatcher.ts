import { useEffect, useCallback } from 'react'

export type FileChangeType = 'add' | 'change' | 'unlink'

export interface FileChangeEvent {
  type: FileChangeType
  path: string
  columnId: string
}

export interface FileWatcherAPI {
  watch: (
    path: string,
    callback: (event: FileChangeEvent) => void
  ) => () => void
}

let watcherAPI: FileWatcherAPI | null = null

export function setFileWatcherAPI(api: FileWatcherAPI) {
  watcherAPI = api
}

/**
 * Hook to watch for file system changes in kanban-data directory
 * @param columns - Array of column IDs to watch
 * @param onFileChange - Callback when a file changes
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useFileWatcher(
  columns: string[],
  onFileChange: (event: FileChangeEvent) => void,
  debounceMs = 300
) {
  const debouncedCallback = useCallback(
    debounce(onFileChange, debounceMs),
    [onFileChange, debounceMs]
  )

  useEffect(() => {
    if (!watcherAPI) {
      console.warn('File watcher API not initialized')
      return
    }

    const unwatchFns: (() => void)[] = []

    // Watch each column directory
    for (const columnId of columns) {
      const path = `./kanban-data/${columnId}`
      const unwatch = watcherAPI.watch(path, (event) => {
        debouncedCallback(event)
      })
      unwatchFns.push(unwatch)
    }

    // Cleanup watchers on unmount
    return () => {
      unwatchFns.forEach((unwatch) => unwatch())
    }
  }, [columns, debouncedCallback])
}

/**
 * Debounce utility function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
function debounce(
  fn: (event: FileChangeEvent) => void,
  delay: number
): (event: FileChangeEvent) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (event: FileChangeEvent) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(event)
    }, delay)
  }
}
