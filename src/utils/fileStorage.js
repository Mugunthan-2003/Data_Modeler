const DB_NAME = 'sql_data_model_db';
const DB_VERSION = 2;
const STORE_FILES = 'files';
const STORE_MERGED = 'merged_files';
const STORE_META = 'metadata';
const CURRENT_FILE_KEY = 'current_file';
const DIRECTORY_HANDLE_KEY = 'directory_handle';
const DIRECTORY_PATH_KEY = 'directory_path';

let db = null;
let directoryHandle = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_FILES)) {
                database.createObjectStore(STORE_FILES, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(STORE_MERGED)) {
                database.createObjectStore(STORE_MERGED, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(STORE_META)) {
                database.createObjectStore(STORE_META);
            }
        };
    });
}

async function getDirectoryHandle() {
    if (directoryHandle) {
        try {
            await directoryHandle.requestPermission({ mode: 'readwrite' });
            return directoryHandle;
        } catch (error) {
            console.error('Permission error:', error);
            directoryHandle = null;
        }
    }

    const database = await openDB();
    const transaction = database.transaction([STORE_META], 'readonly');
    const store = transaction.objectStore(STORE_META);
    const request = store.get(DIRECTORY_HANDLE_KEY);

    return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
            const handle = request.result;
            if (handle) {
                try {
                    await handle.requestPermission({ mode: 'readwrite' });
                    directoryHandle = handle;
                    resolve(handle);
                } catch (error) {
                    console.error('Permission error:', error);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function selectStorageDirectory() {
    if (!window.showDirectoryPicker) {
        throw new Error('File System Access API is not supported in this browser');
    }

    try {
        const handle = await window.showDirectoryPicker();
        await handle.requestPermission({ mode: 'readwrite' });
        
        directoryHandle = handle;
        const directoryPath = handle.name;

        const database = await openDB();
        const transaction = database.transaction([STORE_META], 'readwrite');
        const store = transaction.objectStore(STORE_META);
        store.put(handle, DIRECTORY_HANDLE_KEY);
        store.put(directoryPath, DIRECTORY_PATH_KEY);

        await syncFilesFromDirectory(handle);

        return handle;
    } catch (error) {
        if (error.name === 'AbortError') {
            return null;
        }
        throw error;
    }
}

async function syncFilesFromDirectory(directoryHandle) {
    try {
        const database = await openDB();
        
        await new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_FILES], 'readwrite');
            const store = transaction.objectStore(STORE_FILES);
            const clearRequest = store.clear();
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        });

        const fileEntries = [];
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const fileHandle = await directoryHandle.getFileHandle(entry.name);
                    const fileObj = await fileHandle.getFile();
                    
                    const fileEntry = {
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${fileEntries.length}`,
                        name: entry.name,
                        createdAt: fileObj.lastModified ? new Date(fileObj.lastModified).toISOString() : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    
                    fileEntries.push(fileEntry);
                } catch (error) {
                    console.error(`Error reading file ${entry.name}:`, error);
                }
            }
        }

        if (fileEntries.length > 0) {
            await new Promise((resolve, reject) => {
                const transaction = database.transaction([STORE_FILES], 'readwrite');
                const store = transaction.objectStore(STORE_FILES);
                let completed = 0;
                let hasError = false;

                for (const fileEntry of fileEntries) {
                    const addRequest = store.add(fileEntry);
                    addRequest.onsuccess = () => {
                        completed++;
                        if (completed === fileEntries.length && !hasError) {
                            resolve();
                        }
                    };
                    addRequest.onerror = () => {
                        if (!hasError) {
                            hasError = true;
                            reject(addRequest.error);
                        }
                    };
                }
            });
        }
    } catch (error) {
        console.error('Error syncing files from directory:', error);
    }
}

async function clearAllFiles() {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_FILES], 'readwrite');
        const store = transaction.objectStore(STORE_FILES);
        store.clear();
    } catch (error) {
        console.error('Error clearing files:', error);
    }
}

export async function getStorageDirectory() {
    return await getDirectoryHandle();
}

export async function getStorageDirectoryPath() {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_META], 'readonly');
        const store = transaction.objectStore(STORE_META);
        const request = store.get(DIRECTORY_PATH_KEY);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const storedPath = request.result;
                if (storedPath) {
                    resolve(storedPath);
                    return;
                }
                
                const handle = await getDirectoryHandle();
                if (handle) {
                    const folderName = handle.name;
                    resolve(folderName || "");
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting directory path:', error);
        return null;
    }
}

export async function getAllFiles() {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_FILES], 'readonly');
        const store = transaction.objectStore(STORE_FILES);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error reading files from storage:', error);
        return [];
    }
}

export async function saveFile(fileName, fileData) {
    try {
        let handle = await getDirectoryHandle();
        if (!handle) {
            handle = await selectStorageDirectory();
            if (!handle) {
                throw new Error('No storage directory selected');
            }
        }

        const files = await getAllFiles();
        const fileId = Date.now().toString();
        const fileEntry = {
            id: fileId,
            name: fileName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const existingIndex = files.findIndex(f => f.name === fileName);
        if (existingIndex >= 0) {
            fileEntry.id = files[existingIndex].id;
            fileEntry.createdAt = files[existingIndex].createdAt;
        }

        const fileHandle = await handle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(fileData, null, 2));
        await writable.close();

        const database = await openDB();
        const transaction = database.transaction([STORE_FILES], 'readwrite');
        const store = transaction.objectStore(STORE_FILES);
        
        if (existingIndex >= 0) {
            store.put(fileEntry);
        } else {
            store.add(fileEntry);
        }

        return fileEntry;
    } catch (error) {
        console.error('Error saving file to storage:', error);
        throw error;
    }
}

export async function getFile(fileId) {
    try {
        const files = await getAllFiles();
        const file = files.find(f => f.id === fileId);
        if (!file) return null;

        const handle = await getDirectoryHandle();
        if (!handle) {
            throw new Error('No storage directory available');
        }

        const fileHandle = await handle.getFileHandle(file.name);
        const fileObj = await fileHandle.getFile();
        const text = await fileObj.text();
        const data = JSON.parse(text);

        return {
            ...file,
            data: data
        };
    } catch (error) {
        console.error('Error getting file from storage:', error);
        return null;
    }
}

export async function renameFile(fileId, newFileName) {
    try {
        const files = await getAllFiles();
        const file = files.find(f => f.id === fileId);
        if (!file) return false;

        if (file.name === newFileName) return true;

        const handle = await getDirectoryHandle();
        if (!handle) {
            throw new Error('No storage directory available');
        }

        const oldFileHandle = await handle.getFileHandle(file.name);
        const fileObj = await oldFileHandle.getFile();
        const text = await fileObj.text();
        const data = JSON.parse(text);

        const newFileHandle = await handle.getFileHandle(newFileName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(text);
        await writable.close();

        try {
            await handle.removeEntry(file.name);
        } catch (error) {
            console.warn('Error removing old file:', error);
        }

        const updatedFileEntry = {
            ...file,
            name: newFileName,
            updatedAt: new Date().toISOString(),
        };

        const database = await openDB();
        const transaction = database.transaction([STORE_FILES], 'readwrite');
        const store = transaction.objectStore(STORE_FILES);
        store.put(updatedFileEntry);

        return true;
    } catch (error) {
        console.error('Error renaming file:', error);
        return false;
    }
}

export async function deleteFile(fileId) {
    try {
        const files = await getAllFiles();
        const file = files.find(f => f.id === fileId);
        if (!file) return false;

        const handle = await getDirectoryHandle();
        if (handle) {
            try {
                await handle.removeEntry(file.name);
            } catch (error) {
                console.warn('Error deleting file from directory:', error);
            }
        }

        const database = await openDB();
        const transaction = database.transaction([STORE_FILES], 'readwrite');
        const store = transaction.objectStore(STORE_FILES);
        store.delete(fileId);

        return true;
    } catch (error) {
        console.error('Error deleting file from storage:', error);
        return false;
    }
}

export function setCurrentFile(fileId) {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await openDB();
            const transaction = database.transaction([STORE_META], 'readwrite');
            const store = transaction.objectStore(STORE_META);
            if (fileId) {
                store.put(fileId, CURRENT_FILE_KEY);
            } else {
                store.delete(CURRENT_FILE_KEY);
            }
            resolve();
        } catch (error) {
            console.error('Error setting current file:', error);
            reject(error);
        }
    });
}

export function getCurrentFile() {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await openDB();
            const transaction = database.transaction([STORE_META], 'readonly');
            const store = transaction.objectStore(STORE_META);
            const request = store.get(CURRENT_FILE_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        } catch (error) {
            console.error('Error getting current file:', error);
            resolve(null);
        }
    });
}

export function clearCurrentFile() {
    return setCurrentFile(null);
}

export async function getAllMergedFiles() {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_MERGED], 'readonly');
        const store = transaction.objectStore(STORE_MERGED);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error reading merged files from storage:', error);
        return [];
    }
}

export async function saveMergedFile(fileName, fileData, sourceFileIds) {
    try {
        let handle = await getDirectoryHandle();
        if (!handle) {
            handle = await selectStorageDirectory();
            if (!handle) {
                throw new Error('No storage directory selected');
            }
        }

        const mergedFolderHandle = await handle.getDirectoryHandle('merged', { create: true });
        const fileHandle = await mergedFolderHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(fileData, null, 2));
        await writable.close();

        const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const fileEntry = {
            id: fileId,
            name: fileName,
            sourceFileIds: sourceFileIds || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: fileData,
        };

        const database = await openDB();
        const transaction = database.transaction([STORE_MERGED], 'readwrite');
        const store = transaction.objectStore(STORE_MERGED);
        store.add(fileEntry);

        return fileEntry;
    } catch (error) {
        console.error('Error saving merged file to storage:', error);
        throw error;
    }
}

export async function getMergedFile(fileId) {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_MERGED], 'readonly');
        const store = transaction.objectStore(STORE_MERGED);
        const request = store.get(fileId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting merged file from storage:', error);
        return null;
    }
}

export async function renameMergedFile(fileId, newFileName) {
    try {
        const mergedFile = await getMergedFile(fileId);
        if (!mergedFile) return false;

        if (mergedFile.name === newFileName) return true;

        const handle = await getDirectoryHandle();
        if (!handle) {
            throw new Error('No storage directory available');
        }

        const mergedFolderHandle = await handle.getDirectoryHandle('merged');
        const oldFileHandle = await mergedFolderHandle.getFileHandle(mergedFile.name);
        const fileObj = await oldFileHandle.getFile();
        const text = await fileObj.text();

        const newFileHandle = await mergedFolderHandle.getFileHandle(newFileName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(text);
        await writable.close();

        try {
            await mergedFolderHandle.removeEntry(mergedFile.name);
        } catch (error) {
            console.warn('Error removing old merged file:', error);
        }

        const updatedFileEntry = {
            ...mergedFile,
            name: newFileName,
            updatedAt: new Date().toISOString(),
        };

        const database = await openDB();
        const transaction = database.transaction([STORE_MERGED], 'readwrite');
        const store = transaction.objectStore(STORE_MERGED);
        store.put(updatedFileEntry);

        return true;
    } catch (error) {
        console.error('Error renaming merged file:', error);
        return false;
    }
}

export async function deleteMergedFile(fileId) {
    try {
        const mergedFile = await getMergedFile(fileId);
        if (mergedFile) {
            const handle = await getDirectoryHandle();
            if (handle) {
                try {
                    const mergedFolderHandle = await handle.getDirectoryHandle('merged');
                    await mergedFolderHandle.removeEntry(mergedFile.name);
                } catch (error) {
                    console.warn('Error deleting merged file from directory:', error);
                }
            }
        }

        const database = await openDB();
        const transaction = database.transaction([STORE_MERGED], 'readwrite');
        const store = transaction.objectStore(STORE_MERGED);
        store.delete(fileId);

        return true;
    } catch (error) {
        console.error('Error deleting merged file from storage:', error);
        return false;
    }
}
