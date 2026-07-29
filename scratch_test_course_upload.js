import fs from 'node:fs'
import path from 'node:path'

// Load .env
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
}

import { createDatabase } from './server/database.js'

async function testCourseWorkflow() {
  console.log('Testing Course Upload & Workflow...')
  const db = await createDatabase()

  // 1. Create a course
  const newCourse = await db.createCourse({
    title: 'Test Course 2045',
    category: 'Web Development',
    description: 'A test course for verifying backend upload pipeline.'
  }, 'team_user_1')

  console.log('1. Created Course:', newCourse.id, newCourse.title)

  // 2. Add module
  const modId = 'mod_test_1'
  const updatedCourse1 = await db.updateCourse(newCourse.id, {
    modules: [{ id: modId, title: 'Module 1: Getting Started', lessons: [] }]
  })
  console.log('2. Added Module:', updatedCourse1.modules.length, 'modules')

  // 3. Add lesson
  const lesId = 'les_test_1'
  const lessonObj = {
    id: lesId,
    title: 'Lesson 1: Introduction to FUI',
    description: 'Overview of futuristic user interface development.',
    videoUrl: '/uploads/courses/videos/sample.mp4',
    driveLink: '',
    resources: '',
    notes: 'Key concepts included.'
  }

  const modulesWithLesson = updatedCourse1.modules.map(m =>
    m.id === modId ? { ...m, lessons: [...m.lessons, lessonObj] } : m
  )

  const updatedCourse2 = await db.updateCourse(newCourse.id, { modules: modulesWithLesson })
  console.log('3. Added Lesson:', updatedCourse2.modules[0].lessons.length, 'lessons')

  // 4. Verify fetch
  const fetchedCourse = await db.courseById(newCourse.id)
  console.log('4. Fetched Course Verified:', fetchedCourse.id === newCourse.id, 'Lessons:', fetchedCourse.modules[0].lessons[0].title)

  // Clean up test course
  await db.deleteCourse(newCourse.id)
  console.log('5. Deleted Test Course successfully!')
}

testCourseWorkflow().catch(err => {
  console.error('Course Upload Workflow Test Failed:', err)
  process.exit(1)
})
