import { FileSystemAPI, setFileSystemAPI } from './fileOperations'

const DB_NAME = 'kanban-db'
const STORE_NAME = 'directory'

async function openDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function storeDirectoryHandle(handle: any): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put(handle, 'directoryHandle')
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getStoredDirectoryHandle(): Promise<any | null> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.get('directoryHandle')
  return new Promise<any>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

async function clearStoredDirectory(): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.delete('directoryHandle')
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadStoredFileSystem(): Promise<boolean> {
  try {
    const storedHandle = await getStoredDirectoryHandle()
    if (!storedHandle) return false

    // Check if we still have permission
    const permission = await storedHandle.queryPermission({
      mode: 'readwrite',
    })
    if (permission !== 'granted') {
      await clearStoredDirectory()
      return false
    }

    // Test permission by trying to access
    await storedHandle.getDirectoryHandle('backlog', { create: false })

    // If succeeds, create fsAPI
    const fsAPI: FileSystemAPI = {
      readdir: async (path: string) => {
        const dirHandle = await getDirectoryHandle(path, storedHandle)
        const files = []
        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === 'file') files.push(name)
        }
        return files
      },

      readFile: async (path: string, encoding: string) => {
        void encoding
        void encoding
        const fileHandle = await getFileHandle(path, storedHandle)
        const file = await fileHandle.getFile()
        return await file.text()
      },

      writeFile: async (path: string, content: string) => {
        const fileHandle = await getFileHandle(path, storedHandle, true)
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()
      },

      unlink: async (path: string) => {
        const dirPath = path.substring(0, path.lastIndexOf('/'))
        const filename = path.substring(path.lastIndexOf('/') + 1)
        const dirHandle = await getDirectoryHandle(dirPath, storedHandle)
        await dirHandle.removeEntry(filename)
      },

      rename: async (oldPath: string, newPath: string) => {
        // Copy content
        const content = await fsAPI.readFile(oldPath, 'utf-8')
        await fsAPI.writeFile(newPath, content)
        await fsAPI.unlink(oldPath)
      },

      mkdir: async (path: string, options?: { recursive: boolean }) => {
        void options
        const parts = path.split('/').filter(p => p)
        let currentHandle = storedHandle
        for (const part of parts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, {
            create: true,
          })
        }
      },
    }

    setFileSystemAPI(fsAPI)
    return true
  } catch (error) {
    // Permission revoked or error, clear stored
    console.error('Error loading stored file system:', error)
    await clearStoredDirectory()
    return false
  }
}

export async function initializeFileSystem(): Promise<void> {
  try {
    // Check if File System Access API is supported
    if (!(window as any).showDirectoryPicker) {
      throw new Error(
        'File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.'
      )
    }

    // Request directory access
    const directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    })

    // Verify the directory has the required subdirectories
    try {
      await directoryHandle.getDirectoryHandle('backlog', { create: false })
    } catch (error) {
      throw new Error(
        'Selected directory must contain a "backlog" subdirectory. Please select the kanban-data folder.'
      )
    }

    // Store the handle
    await storeDirectoryHandle(directoryHandle)

    // Create the API
    const fsAPI: FileSystemAPI = {
      readdir: async (path: string) => {
        const dirHandle = await getDirectoryHandle(path, directoryHandle)
        const files = []
        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === 'file') files.push(name)
        }
        return files
      },

      readFile: async (path: string, encoding: string) => {
        void encoding
        const fileHandle = await getFileHandle(path, directoryHandle)
        const file = await fileHandle.getFile()
        return await file.text()
      },

      writeFile: async (path: string, content: string) => {
        const fileHandle = await getFileHandle(path, directoryHandle, true)
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()
      },

      unlink: async (path: string) => {
        const dirPath = path.substring(0, path.lastIndexOf('/'))
        const filename = path.substring(path.lastIndexOf('/') + 1)
        const dirHandle = await getDirectoryHandle(dirPath, directoryHandle)
        await dirHandle.removeEntry(filename)
      },

      rename: async (oldPath: string, newPath: string) => {
        // Copy content
        const content = await fsAPI.readFile(oldPath, 'utf-8')
        await fsAPI.writeFile(newPath, content)
        await fsAPI.unlink(oldPath)
      },

      mkdir: async (path: string, options?: { recursive: boolean }) => {
        void options
        const parts = path.split('/').filter(p => p)
        let currentHandle = directoryHandle
        for (const part of parts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, {
            create: true,
          })
        }
      },
    }

    // Set the API
    setFileSystemAPI(fsAPI)
  } catch (error) {
    console.error('Failed to initialize file system:', error)
    throw error
  }
}

async function getDirectoryHandle(path: string, rootHandle: any): Promise<any> {
  if (path === './kanban-data' || path === 'kanban-data') return rootHandle

  const parts = path
    .replace('./kanban-data/', '')
    .split('/')
    .filter(p => p)
  let handle = rootHandle
  for (const part of parts) {
    handle = await handle.getDirectoryHandle(part)
  }
  return handle
}

async function getFileHandle(
  path: string,
  rootHandle: any,
  create = false
): Promise<any> {
  const dirPath = path.substring(0, path.lastIndexOf('/'))
  const filename = path.substring(path.lastIndexOf('/') + 1)
  const dirHandle = await getDirectoryHandle(dirPath, rootHandle)
  return await dirHandle.getFileHandle(filename, { create })
}
