import React, { useState } from 'react';
import { Plus, BookOpen, Users, DollarSign, Eye, Edit3, Trash2, Video, FileText, CheckCircle2 } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

export function CourseManager({ courses = [], onLoad, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialCourseForm = {
    title: '',
    instructor: 'Assets Weber Lead',
    category: 'VFX & Animation',
    difficulty: 'Intermediate',
    duration: '12 Hours',
    price: '99',
    isFree: false,
    description: '',
    tags: 'vfx, editing, motion',
    published: true
  };

  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Lesson Manager state
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    driveLink: '',
    resources: '',
    notes: ''
  });
  const [lessonVideo, setLessonVideo] = useState(null);

  const handleCreateOrEditCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title) {
      showToast('Course title is required.');
      return;
    }
    setLoading(true);
    try {
      if (selectedCourse) {
        await api.updateCourse(selectedCourse.id, {
          ...selectedCourse,
          ...courseForm,
          price: courseForm.isFree ? 0 : Number(courseForm.price),
          tags: typeof courseForm.tags === 'string' ? courseForm.tags.split(',').map((t) => t.trim()) : courseForm.tags
        });
        if (thumbnailFile) {
          const fd = new FormData();
          fd.append('thumbnail', thumbnailFile);
          await api.uploadCourseThumbnail(selectedCourse.id, fd);
        }
        showToast('Course updated!');
      } else {
        const { course } = await api.createCourse({
          ...courseForm,
          price: courseForm.isFree ? 0 : Number(courseForm.price),
          tags: typeof courseForm.tags === 'string' ? courseForm.tags.split(',').map((t) => t.trim()) : courseForm.tags
        });
        if (thumbnailFile && course) {
          const fd = new FormData();
          fd.append('thumbnail', thumbnailFile);
          await api.uploadCourseThumbnail(course.id, fd);
        }
        showToast('Course created in MongoDB!');
      }

      setIsModalOpen(false);
      setSelectedCourse(null);
      setCourseForm(initialCourseForm);
      setThumbnailFile(null);
      await onLoad();
    } catch (err) {
      showToast(err.message || 'Course operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.deleteCourse(id);
      showToast('Course deleted.');
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleAddModule = async () => {
    if (!moduleTitle.trim() || !selectedCourse) return;
    const newModule = {
      id: `mod_${Date.now()}`,
      title: moduleTitle.trim(),
      lessons: []
    };
    const updatedModules = [...(selectedCourse.modules || []), newModule];
    try {
      await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules: updatedModules });
      setModuleTitle('');
      await onLoad();
      setSelectedCourse((prev) => ({ ...prev, modules: updatedModules }));
      showToast('Section added!');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleAddLesson = async (modId) => {
    if (!lessonForm.title.trim() || !selectedCourse) return;
    setLoading(true);
    try {
      const lessonId = `les_${Date.now()}`;
      let videoUrl = lessonForm.videoUrl;

      if (lessonVideo) {
        const fd = new FormData();
        fd.append('video', lessonVideo);
        const uploadRes = await api.uploadLessonVideo(selectedCourse.id, lessonId, fd);
        videoUrl = uploadRes.url || videoUrl;
      }

      const newLesson = {
        id: lessonId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        videoUrl,
        driveLink: lessonForm.driveLink.trim(),
        resources: lessonForm.resources.trim(),
        notes: lessonForm.notes.trim()
      };

      const updatedModules = (selectedCourse.modules || []).map((m) => {
        if (m.id === modId) {
          return { ...m, lessons: [...(m.lessons || []), newLesson] };
        }
        return m;
      });

      await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules: updatedModules });
      setLessonForm({ title: '', description: '', videoUrl: '', driveLink: '', resources: '', notes: '' });
      setLessonVideo(null);
      await onLoad();
      setSelectedCourse((prev) => ({ ...prev, modules: updatedModules }));
      showToast('Lesson added to course!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const publishedCount = courses.filter((c) => c.published).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            LMS MANAGEMENT // COURSES
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            LEARNING MANAGEMENT SYSTEM
          </h2>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setSelectedCourse(null);
            setCourseForm(initialCourseForm);
            setIsModalOpen(true);
          }}
          onMouseEnter={playHoverSound}
          style={{
            padding: '12px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} /> Create New Course
        </button>
      </div>

      {/* Course Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>PUBLISHED COURSES</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ffffff' }}>{publishedCount}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>DRAFT COURSES</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ff9500' }}>{draftCount}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>TOTAL STUDENTS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#007aff' }}>1,240</div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>LMS REVENUE</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#34c759' }}>$42,800</div>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {courses.map((crs) => (
          <div
            key={crs.id}
            onMouseEnter={playHoverSound}
            style={{
              position: 'relative',
              borderRadius: 20,
              backgroundColor: 'rgba(12, 12, 16, 0.8)',
              border: '1px solid rgba(255, 45, 85, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 15px 30px rgba(0,0,0,0.6)'
            }}
          >
            <div>
              <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                <img
                  src={mediaUrl(crs.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80')}
                  alt={crs.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 8, backgroundColor: crs.published ? 'rgba(52, 199, 89, 0.9)' : 'rgba(255, 149, 0, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                  {crs.published ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', margin: '0 0 6px 0' }}>
                  {crs.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {crs.description || 'Master high-end digital agency workflows with live project exercises.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                  <span>{(crs.modules || []).reduce((acc, m) => acc + (m.lessons || []).length, 0)} Lessons</span>
                  <span style={{ color: '#ff2d55', fontWeight: 700 }}>{crs.price ? `$${crs.price}` : 'FREE'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => {
                  setSelectedCourse(crs);
                  setIsLessonModalOpen(true);
                }}
                style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Video size={14} /> Lessons
              </button>
              <button
                onClick={() => {
                  setSelectedCourse(crs);
                  setCourseForm({
                    title: crs.title,
                    instructor: crs.teacherName || 'Assets Weber Lead',
                    category: crs.category || 'VFX',
                    difficulty: 'Intermediate',
                    duration: '10 Hours',
                    price: String(crs.price || ''),
                    isFree: crs.price === 0,
                    description: crs.description || '',
                    tags: Array.isArray(crs.tags) ? crs.tags.join(', ') : '',
                    published: crs.published
                  });
                  setIsModalOpen(true);
                }}
                style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDeleteCourse(crs.id)}
                style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Course Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCourse ? 'EDIT COURSE' : 'CREATE NEW COURSE'}>
        <form onSubmit={handleCreateOrEditCourse} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COURSE TITLE *</label>
            <input type="text" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PRICE ($)</label>
            <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>THUMBNAIL IMAGE</label>
            <input type="file" onChange={(e) => setThumbnailFile(e.target.files[0])} style={{ marginTop: 6, color: '#fff', fontSize: '0.8rem' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>DESCRIPTION</label>
            <textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Course'}</button>
          </div>
        </form>
      </GlassModal>

      {/* Lesson Manager Modal */}
      <GlassModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title={`MANAGE LESSONS: ${selectedCourse?.title || ''}`} maxWidth={900}>
        {selectedCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Add Section / Module */}
            <div style={{ display: 'flex', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12 }}>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="New Section Title (e.g. Module 1: Foundational VFX)"
                style={{ flex: 1, padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <button onClick={handleAddModule} style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#ff2d55', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Add Section</button>
            </div>

            {/* List Modules & Add Lesson Forms */}
            {(selectedCourse.modules || []).map((mod) => (
              <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <h4 style={{ color: '#ff2d55', fontFamily: 'monospace', margin: '0 0 16px' }}>{mod.title}</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {(mod.lessons || []).map((les, i) => (
                    <div key={les.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{i + 1}. {les.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{les.videoUrl ? 'Video Uploaded' : les.driveLink ? 'Drive Link' : 'No Video'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Lesson inline form */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <input type="text" placeholder="Lesson Title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <input type="text" placeholder="Drive / Youtube Link" value={lessonForm.driveLink} onChange={(e) => setLessonForm({ ...lessonForm, driveLink: e.target.value })} style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Upload Video:</span>
                    <input type="file" accept="video/*" onChange={(e) => setLessonVideo(e.target.files[0])} style={{ color: '#fff', fontSize: '0.8rem' }} />
                  </div>
                  <button onClick={() => handleAddLesson(mod.id)} disabled={loading} style={{ gridColumn: 'span 2', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.2)', border: '1px solid #ff2d55', color: '#ff2d55', fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Uploading Lesson...' : '+ Add Lesson to Section'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassModal>
    </div>
  );
}
