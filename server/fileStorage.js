import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeStorageName, uploadToFirebaseStorage } from './firebaseStorage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function uploadsRoot() {
  const dir = path.resolve(rootDir, process.env.UPLOADS_DIR || 'uploads')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2, 12)
}

function buildRelativePath(folder, originalName) {
  const filename = `${Date.now()}-${cryptoRandom()}-${safeStorageName(originalName)}`
  return `${folder}/${filename}`
}

async function uploadToLocalStorage(file, folder) {
  const relativePath = buildRelativePath(folder, file.originalname)
  const fullPath = path.join(uploadsRoot(), relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  await fs.promises.writeFile(fullPath, file.buffer)
  return { filename: relativePath, url: `/uploads/${relativePath}` }
}

export async function uploadFile(file, folder) {
  if (process.env.USE_FIREBASE_STORAGE === 'true') {
    try {
      return await uploadToFirebaseStorage(file, folder)
    } catch (err) {
      console.warn('[upload] Firebase failed, using local storage:', err.code || err.message)
      return uploadToLocalStorage(file, folder)
    }
  }
  return uploadToLocalStorage(file, folder)
}

export function uploadsDirectory() {
  return uploadsRoot()
}
