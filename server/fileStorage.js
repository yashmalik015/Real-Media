import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { uploadToCloudinaryStream, uploadToCloudinaryLarge } from './cloudinary.js'
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

  if (file.path) {
    try {
      await fs.promises.rename(file.path, fullPath)
    } catch (_crossDeviceErr) {
      // Fallback if renaming across different filesystem mounts
      await fs.promises.copyFile(file.path, fullPath)
      await fs.promises.unlink(file.path).catch(() => {})
    }
  } else if (file.buffer) {
    await fs.promises.writeFile(fullPath, file.buffer)
  }
  return { filename: relativePath, url: `/uploads/${relativePath}`, publicId: null }
}

export function isCloudinaryConfigured() {
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
  const isVideo = file.mimetype?.startsWith('video/')
  const defaultResourceType = isVideo ? 'video' : 'auto'

  // Videos larger than 95MB exceed Cloudinary standard plan limits (100MB).
  // Save directly to local disk storage to avoid Cloudinary 400 errors and timeouts.
  const isTooLargeForCloudinary = isVideo && file.size && file.size > 95 * 1024 * 1024

  if (isCloudinaryConfigured() && !isTooLargeForCloudinary) {
    try {
      const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9/_\\-]+/g, '-')
      const cloudinaryFolder = `assetsweber/${cleanFolder}`
      
      let result
      if (file.path) {
        // Use chunked upload_large from disk for video or large files
        result = await uploadToCloudinaryLarge(file.path, {
          folder: cloudinaryFolder,
          resourceType: defaultResourceType,
        })
        // Clean up temporary disk file
        await fs.promises.unlink(file.path).catch(() => {})
      } else {
        result = await uploadToCloudinaryStream(file.buffer, {
          folder: cloudinaryFolder,
          resourceType: defaultResourceType,
        })
      }

      return {
        filename: result.publicId,
        url: result.url,
        publicId: result.publicId,
        mediaType: result.resourceType || (isVideo ? 'video' : 'image'),
      }
    } catch (err) {
      console.warn('[Cloudinary Fallback] Upload to Cloudinary failed, falling back to local storage:', err.message || err)
    }
  }
  
  // Fallback to local disk storage if Cloudinary is not configured or fails
  const localRes = await uploadToLocalStorage(file, folder)
  return {
    ...localRes,
    mediaType: isVideo ? 'video' : 'image',
  }
}


export function uploadsDirectory() {
  return uploadsRoot()
}
