import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { uploadToCloudinaryLarge } from '../server/cloudinary.js'
import { createDatabase } from '../server/database.js'

const SOURCE_VIDEO = '/Users/yashmalik/Desktop/Backend video 1.mp4'
const COMPRESSED_VIDEO = '/tmp/backend_video_1_compressed.mp4'
const COURSE_ID = 'course_58ea34afc2f40fff05d13215'
const LESSON_ID = 'les_1793001160640'

async function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    console.log(`[Executing] ${cmd} ${args.slice(0, 6).join(' ')}...`)
    const proc = spawn(cmd, args, { stdio: 'inherit' })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
    proc.on('error', reject)
  })
}

async function main() {
  if (!fs.existsSync(SOURCE_VIDEO)) {
    console.error(`Source video not found: ${SOURCE_VIDEO}`)
    process.exit(1)
  }

  const srcStat = fs.statSync(SOURCE_VIDEO)
  console.log(`Source video found: ${(srcStat.size / (1024 * 1024 * 1024)).toFixed(2)} GB (${SOURCE_VIDEO})`)

  // 1. Compress video if not already compressed
  if (!fs.existsSync(COMPRESSED_VIDEO) || fs.statSync(COMPRESSED_VIDEO).size < 10000000) {
    console.log('[Step 1/3] Compressing video with FFmpeg YouTube-grade compression...')
    const ffmpegArgs = [
      '-y',
      '-i', SOURCE_VIDEO,
      '-c:v', 'libx264',
      '-crf', '24',
      '-preset', 'faster',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(1920,iw)':-2",
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      COMPRESSED_VIDEO
    ]
    await runCommand('ffmpeg', ffmpegArgs)
  } else {
    console.log('[Step 1/3] Using already compressed video at /tmp/backend_video_1_compressed.mp4')
  }

  const compStat = fs.statSync(COMPRESSED_VIDEO)
  const savedMb = ((srcStat.size - compStat.size) / (1024 * 1024)).toFixed(1)
  const savedPct = (((srcStat.size - compStat.size) / srcStat.size) * 100).toFixed(1)
  console.log(`✓ Compression complete! New size: ${(compStat.size / (1024 * 1024)).toFixed(1)} MB (${savedPct}% saved, -${savedMb} MB)`)

  // 2. Upload to Cloudinary using chunked upload
  console.log('[Step 2/3] Uploading compressed video to Cloudinary...')
  const uploadResult = await uploadToCloudinaryLarge(COMPRESSED_VIDEO, {
    folder: 'assetsweber/courses/videos',
    resourceType: 'video',
  })
  console.log('✓ Cloudinary upload successful!')
  console.log(`URL: ${uploadResult.url}`)

  // 3. Update MongoDB Course & Lesson record
  console.log('[Step 3/3] Updating MongoDB database with new streaming URL...')
  const db = await createDatabase()
  const course = await db.courseById(COURSE_ID)
  if (!course) {
    console.error(`Course ${COURSE_ID} not found in database!`)
    process.exit(1)
  }

  let updated = false
  const updatedModules = (course.modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).map(l => {
      if (l.id === LESSON_ID) {
        updated = true
        console.log(`Updating lesson "${l.title}" from old URL: ${l.videoUrl}`)
        return {
          ...l,
          videoUrl: uploadResult.url,
          video_url: uploadResult.url,
        }
      }
      return l
    })
  }))

  if (!updated) {
    console.warn(`Lesson ${LESSON_ID} not found in course modules!`)
  } else {
    await db.updateCourse(COURSE_ID, { modules: updatedModules })
    console.log(`✓ Database updated successfully for lesson ${LESSON_ID}!`)
  }

  console.log('ALL DONE! Lesson video is now fully compressed, hosted on Cloudinary, and live in database.')
  process.exit(0)
}

main().catch(err => {
  console.error('Process failed:', err)
  process.exit(1)
})
