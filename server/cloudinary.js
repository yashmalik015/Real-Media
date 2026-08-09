import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

function initCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
    })
  } else if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
}

initCloudinary()

/**
 * Upload a buffer directly to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Upload options
 * @param {string} options.folder - Destination folder (e.g. 'assetsweber/portfolio/video-editing')
 * @param {string} [options.resourceType='auto'] - 'auto', 'image', 'video', or 'raw'
 * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
 */
export function uploadToCloudinaryStream(buffer, { folder = 'assetsweber/uploads', resourceType = 'auto' } = {}) {
  initCloudinary()
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error)
          return reject(error)
        }
        let url = result.secure_url
        if (result.resource_type === 'video' && url.includes('/upload/')) {
          url = url.replace('/upload/', '/upload/f_auto,q_auto,w_1280,c_limit/')
        }
        resolve({
          url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        })
      },
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

/**
 * Delete an asset from Cloudinary using publicId.
 * @param {string} publicId - The public_id of the Cloudinary asset
 * @param {string} [resourceType='image'] - 'image' or 'video' or 'raw'
 * @returns {Promise<Object>}
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!publicId) return { result: 'not_found' }
  initCloudinary()
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
      invalidate: true,
    })
    console.log(`[Cloudinary Delete] ${publicId} (${resourceType}):`, result)
    return result
  } catch (err) {
    console.error(`[Cloudinary Delete Error] ${publicId}:`, err.message)
    // If deleting with image fails, try video as fallback
    if (resourceType !== 'video') {
      try {
        return await cloudinary.uploader.destroy(publicId, {
          resource_type: 'video',
          invalidate: true,
        })
      } catch {
        // silent
      }
    }
    return { result: 'error', error: err.message }
  }
}

export default cloudinary
