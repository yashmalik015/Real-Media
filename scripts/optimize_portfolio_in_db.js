import 'dotenv/config'
import { createDatabase } from '../server/database.js'

async function main() {
  const db = await createDatabase()
  const portfolio = await db.portfolio()
  console.log(`Auditing and optimizing ${portfolio.length} portfolio items in database...`)

  for (const item of portfolio) {
    let changed = false
    const update = {}

    // 1. Optimize Video URLs with Cloudinary auto-compression & dynamic bitrate
    if (item.mediaType === 'video' || /\.(mp4|webm|mov|mkv)/i.test(item.mediaUrl || item.videoUrl || '')) {
      const vUrl = item.mediaUrl || item.videoUrl || ''
      if (vUrl.includes('res.cloudinary.com') && vUrl.includes('/upload/')) {
        let cleanUrl = vUrl
        // Remove duplicate or broken flags
        cleanUrl = cleanUrl.replace('/upload/f_auto,q_auto,fl_faststart,w_1280,c_limit/', '/upload/')
        cleanUrl = cleanUrl.replace('/upload/f_auto,q_auto,w_1280,c_limit/', '/upload/')
        
        const optimizedUrl = cleanUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1280,c_limit/')
        if (optimizedUrl !== item.mediaUrl || optimizedUrl !== item.videoUrl) {
          update.mediaUrl = optimizedUrl
          update.videoUrl = optimizedUrl
          changed = true
        }

        // Automatic thumbnail extraction from video at frame 0 (so_0)
        if (!item.thumbnail) {
          const posterUrl = cleanUrl
            .replace(/\.(mp4|webm|mov|mkv)$/i, '.jpg')
            .replace('/video/upload/', '/video/upload/so_0,w_720,c_limit/')
          update.thumbnail = posterUrl
          changed = true
          console.log(`[Auto-Poster Generated] "${item.title}" -> ${posterUrl}`)
        }
      } else if (vUrl.startsWith('/uploads/')) {
        // Dead local upload file check
        console.warn(`[Local Upload Detected] "${item.title}": ${vUrl}`)
      }
    }

    // 2. Optimize Images with Cloudinary auto-compression
    if (item.mediaType === 'image' || !item.mediaType) {
      if (item.mediaUrl && item.mediaUrl.includes('res.cloudinary.com') && item.mediaUrl.includes('/upload/')) {
        if (!item.mediaUrl.includes('f_auto') && !item.mediaUrl.includes('q_auto')) {
          update.mediaUrl = item.mediaUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1920,c_limit/')
          changed = true
        }
      }
      if (item.thumbnail && item.thumbnail.includes('res.cloudinary.com') && item.thumbnail.includes('/upload/')) {
        if (!item.thumbnail.includes('f_auto') && !item.thumbnail.includes('q_auto')) {
          update.thumbnail = item.thumbnail.replace('/upload/', '/upload/f_auto,q_auto,w_720,c_limit/')
          changed = true
        }
      }
    }

    if (changed) {
      await db.updatePortfolio(item.id, update)
      console.log(`✓ Updated portfolio item "${item.title}" (${item.id})`)
    }
  }

  console.log('✓ Portfolio database optimization complete!')
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
