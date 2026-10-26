import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

let ffmpegCheckCache = null

/**
 * Checks if ffmpeg is available on the operating system PATH
 * @returns {Promise<boolean>}
 */
export async function isFfmpegAvailable() {
  if (ffmpegCheckCache !== null) return ffmpegCheckCache
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-version'])
      proc.on('error', () => {
        ffmpegCheckCache = false
        resolve(false)
      })
      proc.on('close', (code) => {
        ffmpegCheckCache = code === 0
        resolve(ffmpegCheckCache)
      })
    } catch {
      ffmpegCheckCache = false
      resolve(false)
    }
  })
}

/**
 * Compresses and optimizes a video file using FFmpeg with YouTube-grade perceptual compression:
 * - H.264 video codec with CRF 24 (high fidelity, ~75-85% size reduction)
 * - AAC 128kbps stereo audio
 * - -movflags +faststart: moves moov atom index to file header for instant zero-buffering playback
 * - Max resolution 1080p cap (downscales 4K/2K to 1080p preserving aspect ratio and even dimensions)
 *
 * @param {string} inputPath - Source video file on disk
 * @param {string} outputPath - Destination compressed video file path
 * @returns {Promise<boolean>} - True if compression succeeded
 */
export async function compressVideo(inputPath, outputPath) {
  const available = await isFfmpegAvailable()
  if (!available) {
    console.log('[Video Compressor] ffmpeg not available in system environment, skipping local transcode.')
    return false
  }

  return new Promise((resolve) => {
    console.log(`[Video Compressor] Starting YouTube-grade compression for: ${path.basename(inputPath)}...`)
    const startTime = Date.now()

    // -vf "scale='min(1920,iw)':-2" ensures max 1920 width, keeps aspect ratio and guarantees divisible by 2
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', '24',
      '-preset', 'faster',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(1920,iw)':-2",
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath,
    ]

    const proc = spawn('ffmpeg', args)

    proc.on('error', (err) => {
      console.warn('[Video Compressor Error]:', err.message)
      resolve(false)
    })

    proc.on('close', (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      if (code === 0 && fs.existsSync(outputPath)) {
        const inStat = fs.statSync(inputPath)
        const outStat = fs.statSync(outputPath)
        const savedPercent = (((inStat.size - outStat.size) / inStat.size) * 100).toFixed(1)
        console.log(`[Video Compressor Success] Compressed from ${(inStat.size / (1024 * 1024)).toFixed(1)}MB to ${(outStat.size / (1024 * 1024)).toFixed(1)}MB (${savedPercent}% saved) in ${elapsed}s.`)
        resolve(true)
      } else {
        console.warn(`[Video Compressor Failed] ffmpeg exited with code ${code}`)
        resolve(false)
      }
    })
  })
}

/**
 * Compresses and optimizes an image file using FFmpeg:
 * - Downscales to max 1920px width preserving aspect ratio
 * - High visual quality
 *
 * @param {string} inputPath
 * @param {string} outputPath
 * @returns {Promise<boolean>}
 */
export async function compressImage(inputPath, outputPath) {
  const available = await isFfmpegAvailable()
  if (!available) return false

  return new Promise((resolve) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-vf', "scale='min(1920,iw)':-2",
      '-q:v', '2',
      outputPath,
    ]

    const proc = spawn('ffmpeg', args)
    proc.on('error', () => resolve(false))
    proc.on('close', (code) => {
      resolve(code === 0 && fs.existsSync(outputPath))
    })
  })
}

