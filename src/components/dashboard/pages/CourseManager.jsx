import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Video, ListVideo, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

const emptyLessonForm = {
  title: '',
  description: '',
  videoUrl: '',
  driveLink: '',
  resources: '',
  notes: ''
};

const courseCategories = ['VFX & Animation', 'Video Editing', 'Web Development', 'Digital Marketing', 'Graphic Design', 'UI/UX Design'];

export function CourseManager({ courses = [], onLoad, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [playlistCourse, setPlaylistCourse] = useState(null);
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

  const [moduleTitle, setModuleTitle] = useState('');
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [lessonVideo, setLessonVideo] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (playlistCourse && courses.length) {
      const fresh = courses.find((c) => c.id === playlistCourse.id);
      if (fresh) setPlaylistCourse(fresh);
    }
  }, [courses, playlistCourse?.id]);

  const handleCreateOrEditCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      showToast('Course title is required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...courseForm,
        price: courseForm.isFree ? 0 : Number(courseForm.price) || 0,
        tags: typeof courseForm.tags === 'string' ? courseForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : courseForm.tags
      };

      if (editingCourse) {
        await api.updateCourse(editingCourse.id, { ...editingCourse, ...payload });
        if (thumbnailFile) {
          const fd = new FormData();
          fd.append('thumbnail', thumbnailFile);
          await api.uploadCourseThumbnail(editingCourse.id, fd);
        }
        showToast('Course updated!');
      } else {
        const { course } = await api.createCourse(payload);
        if (thumbnailFile && course) {
          const fd = new FormData();
          fd.append('thumbnail', thumbnailFile);
          await api.uploadCourseThumbnail(course.id, fd);
        }
        showToast('Course created! Open "Manage Videos" to add playlists and upload lessons.');
      }

      setIsModalOpen(false);
      setEditingCourse(null);
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
    if (!confirm('Delete this course and all its videos?')) return;
    try {
      await api.deleteCourse(id);
      showToast('Course deleted.');
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleAddModule = async () => {
    if (!moduleTitle.trim() || !playlistCourse) return;
    const newModule = {
      id: `mod_${Date.now()}`,
      title: moduleTitle.trim(),
      lessons: []
    };
    const updatedModules = [...(playlistCourse.modules || []), newModule];
    try {
      await api.updateCourse(playlistCourse.id, { ...playlistCourse, modules: updatedModules });
      setModuleTitle('');
      setExpandedModules((prev) => ({ ...prev, [newModule.id]: true }));
      await onLoad();
      showToast('Playlist section added!');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!playlistCourse || !confirm('Delete this playlist section and all its videos?')) return;
    const updatedModules = (playlistCourse.modules || []).filter((m) => m.id !== modId);
    try {
      await api.updateCourse(playlistCourse.id, { ...playlistCourse, modules: updatedModules });
      await onLoad();
      showToast('Section deleted.');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleAddLesson = async (modId) => {
    if (!lessonForm.title.trim() || !playlistCourse) return;
    setLoading(true);
    try {
      const lessonId = `les_${Date.now()}`;
      let videoUrl = lessonForm.videoUrl.trim();

      if (lessonVideo) {
        const fd = new FormData();
        fd.append('video', lessonVideo);
        const uploadRes = await api.uploadLessonVideo(playlistCourse.id, lessonId, fd);
        videoUrl = uploadRes.url || videoUrl;
      }

      const newLesson = {
        id: lessonId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        videoUrl,
        driveLink: lessonForm.driveLink.trim(),
        resources: lessonForm.resources.trim(),
        notes: lessonForm.notes.trim(),
        uploadedAt: new Date().toISOString()
      };

      const updatedModules = (playlistCourse.modules || []).map((m) => {
        if (m.id === modId) {
          return { ...m, lessons: [...(m.lessons || []), newLesson] };
        }
        return m;
      });

      await api.updateCourse(playlistCourse.id, { ...playlistCourse, modules: updatedModules });
      setLessonForm(emptyLessonForm);
      setLessonVideo(null);
      setActiveModuleId(null);
      await onLoad();
      showToast('Video lesson added!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (modId, lessonId) => {
    if (!lessonForm.title.trim() || !playlistCourse) return;
    setLoading(true);
    try {
      let videoUrl = lessonForm.videoUrl.trim();

      if (lessonVideo) {
        const fd = new FormData();
        fd.append('video', lessonVideo);
        const uploadRes = await api.uploadLessonVideo(playlistCourse.id, lessonId, fd);
        videoUrl = uploadRes.url || videoUrl;
      }

      const updatedModules = (playlistCourse.modules || []).map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          lessons: (m.lessons || []).map((l) => {
            if (l.id !== lessonId) return l;
            return {
              ...l,
              title: lessonForm.title.trim(),
              description: lessonForm.description.trim(),
              videoUrl: videoUrl || l.videoUrl,
              driveLink: lessonForm.driveLink.trim(),
              resources: lessonForm.resources.trim(),
              notes: lessonForm.notes.trim()
            };
          })
        };
      });

      await api.updateCourse(playlistCourse.id, { ...playlistCourse, modules: updatedModules });
      setLessonForm(emptyLessonForm);
      setLessonVideo(null);
      setEditingLesson(null);
      setActiveModuleId(null);
      await onLoad();
      showToast('Lesson updated!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (modId, lessonId) => {
    if (!playlistCourse || !confirm('Delete this video lesson?')) return;
    const updatedModules = (playlistCourse.modules || []).map((m) => {
      if (m.id !== modId) return m;
      return { ...m, lessons: (m.lessons || []).filter((l) => l.id !== lessonId) };
    });
    try {
      await api.updateCourse(playlistCourse.id, { ...playlistCourse, modules: updatedModules });
      await onLoad();
      showToast('Lesson deleted.');
    } catch (err) {
      showToast(err.message);
    }
  };

  const startEditLesson = (modId, lesson) => {
    setEditingLesson({ modId, lessonId: lesson.id });
    setActiveModuleId(modId);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      driveLink: lesson.driveLink || '',
      resources: lesson.resources || '',
      notes: lesson.notes || ''
    });
    setLessonVideo(null);
    setExpandedModules((prev) => ({ ...prev, [modId]: true }));
  };

  const cancelLessonForm = () => {
    setLessonForm(emptyLessonForm);
    setLessonVideo(null);
    setEditingLesson(null);
    setActiveModuleId(null);
  };

  const openCreateCourse = () => {
    playClickSound();
    setEditingCourse(null);
    setCourseForm(initialCourseForm);
    setThumbnailFile(null);
    setIsModalOpen(true);
  };

  const openEditCourse = (crs) => {
    setEditingCourse(crs);
    setCourseForm({
      title: crs.title,
      instructor: crs.instructor || crs.teacherName || 'Assets Weber Lead',
      category: crs.category || 'VFX & Animation',
      difficulty: crs.difficulty || 'Intermediate',
      duration: crs.duration || '10 Hours',
      price: String(crs.price || ''),
      isFree: crs.price === 0 || crs.isFree,
      description: crs.description || '',
      tags: Array.isArray(crs.tags) ? crs.tags.join(', ') : '',
      published: crs.published !== false
    });
    setThumbnailFile(null);
    setIsModalOpen(true);
  };

  const openPlaylistManager = (crs) => {
    setPlaylistCourse(crs);
    setModuleTitle('');
    setLessonForm(emptyLessonForm);
    setLessonVideo(null);
    setEditingLesson(null);
    setActiveModuleId(null);
    const expanded = {};
    (crs.modules || []).forEach((m) => { expanded[m.id] = true; });
    setExpandedModules(expanded);
    setIsLessonModalOpen(true);
  };

  const publishedCount = courses.filter((c) => c.published).length;
  const draftCount = courses.length - publishedCount;

  const renderLessonForm = (modId) => {
    const isEditing = editingLesson?.modId === modId;
    const isAdding = activeModuleId === modId && !isEditing;

    if (!isAdding && !isEditing) {
      return (
        <button
          onClick={() => { setActiveModuleId(modId); setEditingLesson(null); setLessonForm(emptyLessonForm); setLessonVideo(null); }}
          style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.12)', border: '1px dashed rgba(255,45,85,0.4)', color: '#ff2d55', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Video to This Section
        </button>
      );
    }

    return (
      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.25)' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', marginBottom: 12, letterSpacing: '0.1em' }}>
          {isEditing ? 'EDIT VIDEO LESSON' : 'NEW VIDEO LESSON'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>VIDEO TITLE *</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Motion Tracking"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>DESCRIPTION (shown below video like YouTube)</label>
            <textarea
              rows={3}
              placeholder="Describe what students will learn in this video..."
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>YOUTUBE / DRIVE LINK</label>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={lessonForm.driveLink}
              onChange={(e) => setLessonForm({ ...lessonForm, driveLink: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>UPLOAD VIDEO FILE</label>
            <input type="file" accept="video/*" onChange={(e) => setLessonVideo(e.target.files?.[0] || null)} style={{ width: '100%', marginTop: 8, color: '#fff', fontSize: '0.8rem' }} />
            {lessonVideo && <div style={{ fontSize: '0.72rem', color: '#34c759', marginTop: 4 }}>{lessonVideo.name}</div>}
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => (isEditing ? handleUpdateLesson(modId, editingLesson.lessonId) : handleAddLesson(modId))}
              disabled={loading}
              style={{ flex: 1, padding: '10px', borderRadius: 8, backgroundColor: '#ff2d55', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Video Lesson'}
            </button>
            <button
              type="button"
              onClick={cancelLessonForm}
              style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
          onClick={openCreateCourse}
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
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>TOTAL LESSONS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#007aff' }}>
            {courses.reduce((acc, c) => acc + (c.modules || []).reduce((a, m) => a + (m.lessons || []).length, 0), 0)}
          </div>
        </div>
      </div>

      {courses.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', borderRadius: 20, border: '1px dashed rgba(255,45,85,0.35)', backgroundColor: 'rgba(12,12,16,0.5)' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
            No courses yet. Create a course, then add playlist sections and upload videos with titles and descriptions.
          </p>
          <button onClick={openCreateCourse} style={{ padding: '10px 20px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Create First Course
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {courses.map((crs) => {
          const lessonCount = (crs.modules || []).reduce((acc, m) => acc + (m.lessons || []).length, 0);
          const sectionCount = (crs.modules || []).length;
          return (
            <div
              key={crs.id}
              onMouseEnter={playHoverSound}
              style={{
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
                    {crs.description || 'Add a description when editing this course.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                    <span>{sectionCount} Sections • {lessonCount} Videos</span>
                    <span style={{ color: '#ff2d55', fontWeight: 700 }}>{crs.price ? `$${crs.price}` : 'FREE'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => openPlaylistManager(crs)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <ListVideo size={14} /> Manage Videos
                </button>
                <button
                  onClick={() => openEditCourse(crs)}
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
          );
        })}
      </div>

      {/* Create / Edit Course Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? 'EDIT COURSE' : 'CREATE NEW COURSE'} maxWidth={760}>
        <form onSubmit={handleCreateOrEditCourse} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COURSE TITLE *</label>
            <input type="text" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>CATEGORY</label>
            <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: '#0c0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}>
              {courseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>INSTRUCTOR</label>
            <input type="text" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PRICE ($)</label>
            <input type="number" disabled={courseForm.isFree} value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, opacity: courseForm.isFree ? 0.5 : 1 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>THUMBNAIL IMAGE</label>
            <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} style={{ marginTop: 6, color: '#fff', fontSize: '0.8rem' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COURSE DESCRIPTION</label>
            <textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="What will students learn in this course?" style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={courseForm.isFree} onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })} style={{ accentColor: '#ff2d55' }} />
              Free course
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={courseForm.published} onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })} style={{ accentColor: '#ff2d55' }} />
              Publish on website (visible to learners)
            </label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Saving...' : editingCourse ? 'Save Course' : 'Create Course'}</button>
          </div>
        </form>
      </GlassModal>

      {/* Playlist / Video Manager Modal */}
      <GlassModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title={`MANAGE VIDEOS: ${playlistCourse?.title || ''}`} maxWidth={960}>
        {playlistCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: 0 }}>
              Create playlist sections (like YouTube playlists), then add videos with titles and descriptions to each section.
            </p>

            <div style={{ display: 'flex', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12 }}>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="New playlist section (e.g. Module 1: Getting Started)"
                style={{ flex: 1, padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModule())}
              />
              <button onClick={handleAddModule} style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#ff2d55', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add Section
              </button>
            </div>

            {(playlistCourse.modules || []).length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                No playlist sections yet. Add a section above, then upload videos into it.
              </div>
            )}

            {(playlistCourse.modules || []).map((mod, modIndex) => (
              <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedModules[mod.id] !== false ? 16 : 0 }}>
                  <button
                    type="button"
                    onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: '#ff2d55', fontFamily: 'monospace', fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}
                  >
                    <GripVertical size={16} />
                    Section {modIndex + 1}: {mod.title}
                    {(mod.lessons || []).length > 0 && (
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>({(mod.lessons || []).length} videos)</span>
                    )}
                    {expandedModules[mod.id] !== false ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => handleDeleteModule(mod.id)} style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Delete Section
                  </button>
                </div>

                {expandedModules[mod.id] !== false && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                      {(mod.lessons || []).map((les, i) => (
                        <div key={les.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(255,45,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Video size={14} color="#ff2d55" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{i + 1}. {les.title}</div>
                            {les.description && (
                              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: 4, lineHeight: 1.4 }}>{les.description}</div>
                            )}
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: 6, fontFamily: 'monospace' }}>
                              {les.videoUrl ? 'Uploaded video' : les.driveLink ? 'External link' : 'No video attached'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => startEditLesson(mod.id, les)} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleDeleteLesson(mod.id, les.id)} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', fontSize: '0.75rem', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {renderLessonForm(mod.id)}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassModal>
    </div>
  );
}
