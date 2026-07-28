import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { uploadToCloudinaryStream } from './cloudinary.js'
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
  return { filename: relativePath, url: `/uploads/${relativePath}`, publicId: null }
}

function isCloudinaryConfigured() {
  return (
    process.env.USE_CLOUDINARY === 'true' ||
    Boolean(process.env.CLOUDINARY_URL) ||
    Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  )
}

export async function uploadFile(file, folder) {
  // Check Cloudinary storage
  if (isCloudinaryConfigured()) {
    try {
      const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9/_\-]+/g, '-')
      const cloudinaryFolder = `assetsweber/${cleanFolder}`
      const result = await uploadToCloudinaryStream(file.buffer, {
        folder: cloudinaryFolder,
        resourceType: 'auto',
      })
      return {
        filename: result.publicId,
        url: result.url,
        publicId: result.publicId,
        mediaType: result.resourceType,
      }
    } catch (err) {
      console.error('[Upload Failed] Cloudinary upload error:', err)
      throw new Error(`Cloudinary upload failed: ${err.message || 'Unknown error'}`)
    }
  }

  // Check Firebase storage fallback
  if (process.env.USE_FIREBASE_STORAGE === 'true') {
    try {
      return await uploadToFirebaseStorage(file, folder)
    } catch (err) {
      console.warn('[upload] Firebase failed, using local storage:', err.code || err.message)
      return uploadToLocalStorage(file, folder)
    }
  }

  // Default local disk storage
  return uploadToLocalStorage(file, folder)
}

export function uploadsDirectory() {
  return uploadsRoot()
}
