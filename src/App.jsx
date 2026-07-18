import { useEffect, useMemo, useRef, useState } from "react";
import { styles } from "./styles/globalStyles.js";
import { COMPANY_NAME, LOGO_URL, SERVICES, SERVICE_OPTIONS } from "./data/siteData.js";
import { Hero, Footer, Toast, PortfolioSection, TestimonialsSection, ProcessSection } from "./components/index.jsx";
import { signInWithGoogle, handleGoogleRedirectResult } from "./services/firebase.js";

const LS = {
  portfolio: "aw_v2_portfolio",
  testimonials: "aw_v2_testimonials",
  inquiries: "aw_v2_inquiries",
  courses: "aw_v2_courses",
  learners: "aw_v2_learners",
  team: "aw_v2_team",
  settings: "aw_v2_settings",
  session: "aw_v2_session",
};

const DEFAULT_SETTINGS = {
  whatsappNumber: "+919416085060",
  bookingUrl: "https://calendly.com/",
};

const DEFAULT_COURSES = [
  {
    id: "course_web_mvp",
    title: "Web Development for Agencies",
    category: "Web Development",
    description: "Build premium websites, landing pages, and client-ready systems.",
    published: true,
    banner: "",
    thumbnail: "",
    modules: [
      {
        id: "mod_1",
        title: "Foundations",
        lessons: [
          { id: "les_1", title: "Project setup", description: "Plan structure and scope.", videoUrl: "", driveLink: "", resources: "", notes: "" },
          { id: "les_2", title: "Responsive layout", description: "Build desktop and mobile layouts.", videoUrl: "", driveLink: "", resources: "", notes: "" },
        ],
      },
    ],
  },
  {
    id: "course_ai",
    title: "AI Solutions for Workflows",
    category: "Automation",
    description: "Create practical AI workflows and automation systems.",
    published: true,
    banner: "",
    thumbnail: "",
    modules: [
      {
        id: "mod_1",
        title: "Workflow design",
        lessons: [
          { id: "les_1", title: "Identify bottlenecks", description: "Map repetitive tasks.", videoUrl: "", driveLink: "", resources: "", notes: "" },
        ],
      },
    ],
  },
];

const DEFAULT_TEAM = [{ id: "team_1", teamId: "1234567890", password: "admin123", name: "Assets Weber Team" }];
const DEFAULT_TESTIMONIALS = [];
const DEFAULT_PORTFOLIO = [];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function seedStorage() {
  if (!localStorage.getItem(LS.settings)) write(LS.settings, DEFAULT_SETTINGS);
  if (!localStorage.getItem(LS.courses)) write(LS.courses, DEFAULT_COURSES);
  if (!localStorage.getItem(LS.team)) write(LS.team, DEFAULT_TEAM);
  if (!localStorage.getItem(LS.testimonials)) write(LS.testimonials, DEFAULT_TESTIMONIALS);
  if (!localStorage.getItem(LS.portfolio)) write(LS.portfolio, DEFAULT_PORTFOLIO);
  if (!localStorage.getItem(LS.inquiries)) write(LS.inquiries, []);
  if (!localStorage.getItem(LS.learners)) write(LS.learners, []);
}

function NavButton({ active, children, onClick }) {
  return <button className={`nav-link ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}

function SectionHeader({ label, title, sub }) {
  return (
    <>
      <div className="section-label">{label}</div>
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </>
  );
}

function ServiceGrid({ onPick }) {
  return (
    <section className="section" id="services">
      <div className="section-inner">
        <SectionHeader
          label="OUR SERVICES"
          title="Agency Operations and Learning"
          sub="Premium execution across web, mobile, AI, video, content, branding, and automation."
        />
        <div className="services-grid">
          {SERVICES.map((s) => (
            <button className="svc-card" key={s.title} onClick={() => onPick(s.title)}>
              <div className="svc-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="svc-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceDetail({ title, onBack, onInquiry }) {
  const service = SERVICES.find((s) => s.title === title);
  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="section-inner">
        <button className="service-page-back" onClick={onBack}>← Back</button>
        <SectionHeader label={service?.title?.toUpperCase() || "SERVICE"} title={service?.title || title} sub={service?.desc || ""} />
        <div className="why-grid" style={{ marginTop: 40 }}>
          {(service?.details || [
            "Premium execution tailored to business goals.",
            "Clear communication, milestones, and delivery standards.",
            "Built for long-term scalability and brand consistency.",
          ]).map((d) => (
            <div className="why-card" key={d}><p>{d}</p></div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => onInquiry(title)}>Project Requirement Form</button>
      </div>
    </section>
  );
}

function InquiryModal({ initialService, onClose, onSubmit, settings }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", service: initialService || "", budget: "", description: "" });
  return (
    <div className="msf-backdrop">
      <div className="msf-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="bn" style={{ fontSize: "1.8rem" }}>Project Requirement Form</h2>
          <button onClick={onClose} className="service-page-back">✕</button>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Service Required</label><select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>{SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="field"><label>Budget</label><input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="INR" /></div>
        </div>
        <div className="field"><label>Project Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn-primary" onClick={() => onSubmit(form)}>Submit Inquiry</button>
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn-ghost" href={settings.bookingUrl} target="_blank" rel="noreferrer">Book a Discovery Call</a>
          <a className="btn-primary" href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, mode, onGoogleLogin, onClose }) {
  const [tab, setTab] = useState(mode || "learner");
  const [form, setForm] = useState({ name: "", email: "", password: "", teamId: "" });
  const tabSet = (next) => { setTab(next); };
  return (
    <div className="login-page">
      <div className="login-card login-card--wide">
        <button className="login-close" onClick={onClose}>✕</button>
        <div className="login-hero">
          <img src={LOGO_URL} alt={COMPANY_NAME} className="login-logo" />
          <div className="bn login-title">{COMPANY_NAME.toUpperCase()}</div>
          <p className="login-copy">One entry point, two secure paths. Learners can join with email or Google. Team access stays private.</p>
        </div>
        <div className="login-tabs">
          <button className={`login-tab ${tab === "learner" ? "active" : ""}`} onClick={() => tabSet("learner")}>Learner</button>
          <button className={`login-tab ${tab === "team" ? "active" : ""}`} onClick={() => tabSet("team")}>Team</button>
        </div>
        {tab === "learner" ? (
          <>
            <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
            <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create or enter password" /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => onLogin({ role: "learner", name: form.name, email: form.email, password: form.password })}>Continue as Learner</button>
            <button className="google-btn" style={{ marginTop: 12 }} onClick={onGoogleLogin}>Continue with Google</button>
          </>
        ) : (
          <>
            <div className="field"><label>Team ID</label><input value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} placeholder="Enter team ID" /></div>
            <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => onLogin({ role: "team", teamId: form.teamId, password: form.password })}>Continue as Team</button>
          </>
        )}
      </div>
    </div>
  );
}

function LearningPage({ user, courses, onBack }) {
  const [activeId, setActiveId] = useState(courses[0]?.id || null);
  const [activeLessonId, setActiveLessonId] = useState(() => courses[0]?.modules?.[0]?.lessons?.[0]?.id || null);
  const active = useMemo(() => courses.find((course) => course.id === activeId) || courses[0] || null, [courses, activeId]);
  const lessons = useMemo(
    () => active?.modules?.flatMap((m) => m.lessons.map((lesson, lessonIndex) => ({ ...lesson, moduleTitle: m.title, lessonIndex }))) || [],
    [active],
  );
  const current = lessons.find((l) => l.id === activeLessonId) || lessons[0];
  const currentIndex = Math.max(0, lessons.findIndex((l) => l.id === current?.id));
  const next = lessons[currentIndex + 1];
  const prev = lessons[currentIndex - 1];
  const shellStyle = {
    background: "radial-gradient(ellipse at top, rgba(229,57,53,.16) 0%, transparent 38%), #030303",
    minHeight: "100vh",
    color: "#fff",
  };
  const heroStripStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-end",
    marginTop: "28px",
    padding: "22px 24px",
    border: "1px solid rgba(229,57,53,.18)",
    borderRadius: "26px",
    background: "linear-gradient(135deg, rgba(229,57,53,.08), rgba(255,255,255,.03))",
    boxShadow: "0 18px 45px rgba(0,0,0,.28)",
  };
  const dashboardStyle = {
    display: "grid",
    gridTemplateColumns: "360px minmax(0,1fr)",
    gap: "20px",
    marginTop: "42px",
    alignItems: "start",
  };
  const learningTitleStyle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2.8rem, 4.5vw, 4.2rem)",
    letterSpacing: ".03em",
    lineHeight: ".95",
    marginBottom: "16px",
  };
  return (
    <section className="section learning-shell" style={shellStyle}>
      <div className="section-inner learning-shell-inner">
        <div className="learning-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <button className="service-page-back" onClick={onBack}>← Back to Home</button>
          <div className="learning-user-chip" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--line2)", borderRadius: 999, background: "rgba(255,255,255,.03)", color: "var(--muted2)", fontSize: ".88rem" }}>
            <span className="learning-user-dot" />
            {user?.name || "Learner"}
          </div>
        </div>
        <SectionHeader
          label="LEARNING"
          title="Your Course Dashboard"
          sub="Browse courses, jump between lessons, and keep learning in a clean playlist-driven layout."
        />
        <h2 style={learningTitleStyle}>Premium learner workspace</h2>
        <p style={{ maxWidth: 760, color: "rgba(255,255,255,.68)", lineHeight: 1.75, marginTop: -6 }}>
          Course playlists, a focused video player, and lesson notes all live in one branded learning space.
        </p>
        <div className="learning-hero-strip" style={heroStripStyle}>
          <div>
            <div className="dashboard-label">Current Course</div>
            <h2>{active?.title || "No course selected"}</h2>
          </div>
          <div className="learning-hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(92px,1fr))", gap: 12 }}>
            <div className="learning-hero-stat" style={{ minWidth: 92, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 18, background: "rgba(0,0,0,.24)" }}><span>Courses</span><strong>{courses.length}</strong></div>
            <div className="learning-hero-stat" style={{ minWidth: 92, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 18, background: "rgba(0,0,0,.24)" }}><span>Modules</span><strong>{active?.modules?.length || 0}</strong></div>
            <div className="learning-hero-stat" style={{ minWidth: 92, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 18, background: "rgba(0,0,0,.24)" }}><span>Lessons</span><strong>{lessons.length}</strong></div>
          </div>
        </div>
        <div className="learning-dashboard" style={dashboardStyle}>
          <aside className="learning-sidebar" style={{ position: "sticky", top: 106, alignSelf: "start", border: "1px solid var(--line)", borderRadius: 28, background: "linear-gradient(145deg, rgba(14,14,16,.96), rgba(4,4,6,.98))", padding: 20, boxShadow: "0 24px 60px rgba(0,0,0,.34)", maxHeight: "calc(100vh - 150px)", overflow: "auto" }}>
            <div className="learning-sidebar-head">
              <div>
                <div className="dashboard-label">Courses</div>
                <h3>{courses.length} available</h3>
              </div>
            </div>
            <div className="learning-courses">
              {courses.map((c) => (
                  <button
                    key={c.id}
                    className={`learning-course ${active?.id === c.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveId(c.id);
                      setActiveLessonId(c.modules?.[0]?.lessons?.[0]?.id || null);
                    }}
                  >
                    <span>{c.category}</span>
                    <strong>{c.title}</strong>
                    <p>{c.description}</p>
                    <div className="learning-course-foot">
                      <span>{c.modules?.length || 0} modules</span>
                    <span>{c.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0} lessons</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

            <div className="learning-main" style={{ display: "grid", gap: 20 }}>
              {current ? (
                <>
                  <div className="learning-player" style={{ border: "1px solid var(--line2)", borderRadius: 32, background: "linear-gradient(145deg, rgba(14,14,16,.98), rgba(4,4,6,.98))", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.42)" }}>
                    <div className="learning-video-shell" style={{ aspectRatio: "16/9", background: "#050505", borderBottom: "1px solid var(--line)" }}>
                      {current.videoUrl ? (
                        <video controls src={current.videoUrl} className="learning-video" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="learning-video-empty" style={{ minHeight: "100%", display: "grid", placeItems: "center", color: "var(--muted)", padding: 24, textAlign: "center" }}>
                          <div className="learning-video-empty-icon">▶</div>
                          <div>Upload a lesson video to preview it here.</div>
                        </div>
                      )}
                    </div>
                    <div className="learning-player-body" style={{ padding: 28 }}>
                      <div className="learning-player-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div>
                          <div className="dashboard-label">{active?.title}</div>
                          <h3>{current.title}</h3>
                        </div>
                        <div className="dashboard-pill">Lesson {current.lessonIndex + 1}</div>
                      </div>
                      <p style={{ color: "rgba(255,255,255,.64)" }}>{current.description}</p>
                      <div className="learning-meta-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, margin: "18px 0" }}>
                        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 14, background: "rgba(255,255,255,.03)" }}><span>Module</span><strong>{current.moduleTitle}</strong></div>
                        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 14, background: "rgba(255,255,255,.03)" }}><span>Lesson</span><strong>{current.lessonIndex + 1}</strong></div>
                      </div>
                      <div className="learning-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button className="btn-ghost" disabled={!prev} onClick={() => prev && setActiveLessonId(prev.id)}>Previous</button>
                        <button className="btn-primary" disabled={!next} onClick={() => next && setActiveLessonId(next.id)}>Next Lesson</button>
                      </div>
                    </div>
                  </div>

                  <div className="learning-detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    <div className="learning-detail-card" style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 20, background: "rgba(255,255,255,.03)" }}>
                      <div className="dashboard-label">Description</div>
                      <p style={{ color: "rgba(255,255,255,.64)" }}>{current.description}</p>
                    </div>
                    <div className="learning-detail-card" style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 20, background: "rgba(255,255,255,.03)" }}>
                      <div className="dashboard-label">Resources</div>
                      {current.driveLink ? (
                        <a className="btn-ghost" href={current.driveLink} target="_blank" rel="noreferrer">Open Google Drive</a>
                    ) : (
                      <p>No Google Drive link added yet.</p>
                    )}
                  </div>
                    <div className="learning-detail-card learning-detail-card--wide" style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 20, background: "rgba(255,255,255,.03)", gridColumn: "1 / -1" }}>
                      <div className="dashboard-label">Notes</div>
                      {current.notes ? <p style={{ color: "rgba(255,255,255,.64)" }}>{current.notes}</p> : <p style={{ color: "rgba(255,255,255,.64)" }}>No lesson notes yet.</p>}
                      {current.resources && <div className="learning-notes" style={{ marginTop: 12 }}>{current.resources}</div>}
                    </div>
                  </div>
              </>
            ) : (
              <div className="learning-empty">No published courses yet. Team can create and publish one from the dashboard.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamDashboard({ user, state, setState, onBack }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [portForm, setPortForm] = useState({ title: "", service: "Web Development", description: "", category: "", mediaUrl: "", mediaType: "image" });
  const [courseForm, setCourseForm] = useState({ title: "", category: "Web Development", description: "" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", company: "", review: "", image: "", service: "Web Development" });
  const [settings, setSettings] = useState(state.settings);
  const [selectedCourseId, setSelectedCourseId] = useState(state.courses[0]?.id || null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", videoUrl: "", driveLink: "", resources: "", notes: "" });
  const save = (patch) => setState((prev) => ({ ...prev, ...patch }));
  const inquiries = state.inquiries;
  const selectedCourse = state.courses.find((c) => c.id === selectedCourseId) || state.courses[0] || null;

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={LOGO_URL} alt={COMPANY_NAME} />
          <div><div className="bn" style={{ fontSize: "1.1rem", letterSpacing: ".2em" }}>{COMPANY_NAME.toUpperCase()}</div><div style={{ color: "var(--muted)", fontSize: ".76rem" }}>Team Dashboard</div></div>
        </div>
        <button className="btn-ghost" style={{ width: "100%", marginBottom: 16 }} onClick={onBack}>Exit Dashboard</button>
        {["dashboard", "portfolio", "courses", "testimonials", "requests", "settings"].map((k) => <button key={k} className={`snav-btn ${activeNav === k ? "active" : ""}`} onClick={() => setActiveNav(k)}>{k[0].toUpperCase() + k.slice(1)}</button>)}
      </aside>
      <div className="workspace-content" style={{ height: "auto" }}>
        <div className="ws-header"><div className="ws-title">Team Admin</div><div style={{ color: "var(--muted)" }}>{user?.teamId}</div></div>
        {activeNav === "dashboard" && (
          <div className="category-grid">
            <div className="category-card"><h3>Portfolio Management</h3><ul><li>{state.portfolio.length} items</li></ul></div>
            <div className="category-card"><h3>Course Management</h3><ul><li>{state.courses.length} courses</li></ul></div>
            <div className="category-card"><h3>Contact Requests</h3><ul><li>{inquiries.length} inquiries</li></ul></div>
            <div className="category-card"><h3>Testimonials</h3><ul><li>{state.testimonials.length} reviews</li></ul></div>
            <div className="category-card"><h3>Settings</h3><ul><li>{settings.whatsappNumber}</li></ul></div>
          </div>
        )}
        {activeNav === "portfolio" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>{editingPortfolio ? "Edit Portfolio" : "Upload Project"}</h3>
              <div className="msf-grid">
                <div className="field"><label>Title</label><input value={portForm.title} onChange={(e) => setPortForm({ ...portForm, title: e.target.value })} /></div>
                <div className="field"><label>Service</label><select value={portForm.service} onChange={(e) => setPortForm({ ...portForm, service: e.target.value })}>{SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="field"><label>Description</label><textarea value={portForm.description} onChange={(e) => setPortForm({ ...portForm, description: e.target.value })} /></div>
              <div className="msf-grid">
                <div className="field"><label>Category</label><input value={portForm.category} onChange={(e) => setPortForm({ ...portForm, category: e.target.value })} /></div>
                <div className="field"><label>Media URL</label><input value={portForm.mediaUrl} onChange={(e) => setPortForm({ ...portForm, mediaUrl: e.target.value })} /></div>
              </div>
              <button className="btn-primary" onClick={() => {
                const next = editingPortfolio
                  ? state.portfolio.map((p) => p.id === editingPortfolio.id ? { ...p, ...portForm } : p)
                  : [{ id: uid("port"), ...portForm }, ...state.portfolio];
                save({ portfolio: next });
                setEditingPortfolio(null);
                setPortForm({ title: "", service: "Web Development", description: "", category: "", mediaUrl: "", mediaType: "image" });
              }}>{editingPortfolio ? "Update" : "Save"}</button>
            </div>
            <div className="portfolio-grid">
              {state.portfolio.map((p) => <div className="port-card" key={p.id}><div className="port-body"><div className="port-client">{p.service}</div><h3>{p.title}</h3><p>{p.description}</p><button className="btn-ghost" onClick={() => { setEditingPortfolio(p); setPortForm(p); }}>Edit</button><button className="btn-ghost" onClick={() => save({ portfolio: state.portfolio.filter((x) => x.id !== p.id) })}>Delete</button></div></div>)}
            </div>
          </>
        )}
        {activeNav === "courses" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>Create Course</h3>
              <div className="msf-grid">
                <div className="field"><label>Title</label><input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
                <div className="field"><label>Category</label><input value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} /></div>
              </div>
              <div className="field"><label>Description</label><textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
              <button className="btn-primary" onClick={() => {
                const next = { id: uid("course"), ...courseForm, published: true, modules: [] };
                save({ courses: [next, ...state.courses] });
                setCourseForm({ title: "", category: "Web Development", description: "" });
                setSelectedCourseId(next.id);
              }}>Create Course</button>
            </div>
            <div className="category-grid">
              {state.courses.map((course) => (
                <button key={course.id} className={`category-card ${selectedCourseId === course.id ? "active" : ""}`} onClick={() => setSelectedCourseId(course.id)}>
                  <h3>{course.title}</h3>
                  <ul><li>{course.category}</li><li>{course.published ? "Published" : "Unpublished"}</li></ul>
                </button>
              ))}
            </div>
            {selectedCourse && (
              <div className="dashboard-card" style={{ marginTop: 20 }}>
                <div className="dashboard-card-head">
                  <h3>{selectedCourse.title}</h3>
                  <span className="dashboard-pill">{selectedCourse.published ? "Published" : "Draft"}</span>
                </div>
                <p style={{ color: "var(--muted)" }}>{selectedCourse.description}</p>
                <div className="profile-actions" style={{ marginTop: 14 }}>
                  <button className="btn-ghost" onClick={() => save({ courses: state.courses.map((c) => c.id === selectedCourse.id ? { ...c, published: !c.published } : c) })}>{selectedCourse.published ? "Unpublish" : "Publish"}</button>
                  <button className="btn-ghost" onClick={() => save({ courses: state.courses.filter((c) => c.id !== selectedCourse.id) })}>Delete Course</button>
                </div>
                <div className="why-card" style={{ marginTop: 18 }}>
                  <h4>Add Module</h4>
                  <div className="field"><input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title" /></div>
                  <button className="btn-primary" onClick={() => {
                    if (!moduleTitle.trim()) return;
                    save({
                      courses: state.courses.map((c) => c.id === selectedCourse.id ? { ...c, modules: [...(c.modules || []), { id: uid("mod"), title: moduleTitle.trim(), lessons: [] }] } : c),
                    });
                    setModuleTitle("");
                  }}>Add Module</button>
                </div>
                <div className="why-grid" style={{ marginTop: 18 }}>
                  {(selectedCourse.modules || []).map((mod) => (
                    <div className="why-card" key={mod.id}>
                      <h4>{mod.title}</h4>
                      <button className="btn-ghost" onClick={() => save({ courses: state.courses.map((c) => c.id === selectedCourse.id ? { ...c, modules: c.modules.filter((m) => m.id !== mod.id) } : c) })}>Delete Module</button>
                      <div style={{ marginTop: 14 }}>
                        {(mod.lessons || []).map((lesson, index) => (
                          <div key={lesson.id} className="learning-notes" style={{ marginBottom: 10 }}>
                            <strong>{index + 1}. {lesson.title}</strong>
                            <p style={{ marginTop: 6 }}>{lesson.description}</p>
                            <div className="profile-actions" style={{ marginTop: 10 }}>
                              <button className="btn-ghost" onClick={() => save({ courses: state.courses.map((c) => c.id === selectedCourse.id ? { ...c, modules: c.modules.map((m) => m.id === mod.id ? { ...m, lessons: m.lessons.filter((l) => l.id !== lesson.id) } : m) } : c) })}>Delete</button>
                              <button className="btn-ghost" onClick={() => {
                                setLessonForm(lesson);
                              }}>Edit</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="field"><input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" /></div>
                      <div className="field"><textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Lesson description" /></div>
                      <div className="field"><input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="Video URL or upload below" /></div>
                      <div className="field"><input value={lessonForm.driveLink} onChange={(e) => setLessonForm({ ...lessonForm, driveLink: e.target.value })} placeholder="Google Drive link" /></div>
                      <div className="field"><input value={lessonForm.resources} onChange={(e) => setLessonForm({ ...lessonForm, resources: e.target.value })} placeholder="Resources" /></div>
                      <div className="field"><textarea value={lessonForm.notes} onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })} placeholder="Notes" /></div>
                      <div className="field">
                        <label>Upload Video</label>
                        <input type="file" accept="video/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const dataUrl = await fileToDataUrl(file);
                          setLessonForm((prev) => ({ ...prev, videoUrl: dataUrl }));
                        }} />
                      </div>
                      <button className="btn-primary" onClick={() => {
                        if (!lessonForm.title.trim()) return;
                        const lesson = { id: uid("les"), ...lessonForm };
                        save({
                          courses: state.courses.map((c) => c.id === selectedCourse.id ? {
                            ...c,
                            modules: c.modules.map((m) => m.id === mod.id ? { ...m, lessons: [...(m.lessons || []), lesson] } : m),
                          } : c),
                        });
                        setLessonForm({ title: "", description: "", videoUrl: "", driveLink: "", resources: "", notes: "" });
                      }}>Add Lesson</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {activeNav === "testimonials" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h3>
              <div className="msf-grid">
                <div className="field"><label>Name</label><input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} /></div>
                <div className="field"><label>Company</label><input value={testimonialForm.company} onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })} /></div>
              </div>
              <div className="field"><label>Review</label><textarea value={testimonialForm.review} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: e.target.value })} /></div>
              <div className="field"><label>Image URL</label><input value={testimonialForm.image} onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })} /></div>
              <button className="btn-primary" onClick={() => {
                const next = editingTestimonial ? state.testimonials.map((t) => t.id === editingTestimonial.id ? { ...t, ...testimonialForm } : t) : [{ id: uid("t"), ...testimonialForm }, ...state.testimonials];
                save({ testimonials: next });
                setEditingTestimonial(null);
                setTestimonialForm({ name: "", company: "", review: "", image: "", service: "Web Development" });
              }}>{editingTestimonial ? "Update" : "Save"}</button>
            </div>
            <TestimonialsSection testimonials={state.testimonials} user={null} />
          </>
        )}
        {activeNav === "requests" && (
          <div className="dashboard-card">
            {inquiries.map((inq) => (
              <div key={inq.id} className="why-card" style={{ marginBottom: 12 }}>
                <h4>{inq.name}</h4>
                <p>{inq.email} | {inq.phone} | {inq.company}</p>
                <p>{inq.service} | {inq.budget}</p>
                <p>{inq.description}</p>
                <div className="profile-actions">
                  <button className="btn-ghost" onClick={() => save({ inquiries: inquiries.map((x) => x.id === inq.id ? { ...x, status: "Contacted" } : x) })}>Mark as Contacted</button>
                  <button className="btn-ghost" onClick={() => save({ inquiries: inquiries.map((x) => x.id === inq.id ? { ...x, status: "Closed" } : x) })}>Mark as Closed</button>
                  <button className="btn-ghost" onClick={() => save({ inquiries: inquiries.filter((x) => x.id !== inq.id) })}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeNav === "settings" && (
          <div className="port-upload-form">
            <div className="field"><label>WhatsApp Number</label><input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} /></div>
            <div className="field"><label>Discovery Call Link</label><input value={settings.bookingUrl} onChange={(e) => setSettings({ ...settings, bookingUrl: e.target.value })} /></div>
            <button className="btn-primary" onClick={() => save({ settings })}>Save Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedService, setSelectedService] = useState(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("learner");
  const [authTarget, setAuthTarget] = useState("learning");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [session, setSession] = useState(() => read(LS.session, null));
  const [state, setState] = useState(() => ({
    portfolio: read(LS.portfolio, DEFAULT_PORTFOLIO),
    testimonials: read(LS.testimonials, DEFAULT_TESTIMONIALS),
    inquiries: read(LS.inquiries, []),
    courses: read(LS.courses, DEFAULT_COURSES),
    learners: read(LS.learners, []),
    team: read(LS.team, DEFAULT_TEAM),
    settings: read(LS.settings, DEFAULT_SETTINGS),
  }));
  const toastTimer = useRef(null);
  const contactRef = useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  useEffect(() => {
    seedStorage();
    write(LS.portfolio, state.portfolio);
    write(LS.testimonials, state.testimonials);
    write(LS.inquiries, state.inquiries);
    write(LS.courses, state.courses);
    write(LS.learners, state.learners);
    write(LS.team, state.team);
    write(LS.settings, state.settings);
  }, [state]);

  useEffect(() => {
    handleGoogleRedirectResult().then((googleUser) => {
      if (!googleUser) return;
      const learner = {
        id: googleUser.uid,
        role: "learner",
        name: googleUser.displayName || "Learner",
        email: googleUser.email || "",
        password: "",
        google: true,
      };
      const learners = state.learners.some((l) => l.email === learner.email) ? state.learners : [learner, ...state.learners];
      setState((prev) => ({ ...prev, learners }));
      setSession(learner);
      localStorage.setItem(LS.session, JSON.stringify(learner));
      setPage("learning");
      showToast("Signed in with Google.");
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settings = state.settings;

  const nav = useMemo(() => ["Home", "Services", "Portfolio", "Learning", "Process", "Testimonials", "Contact"], []);

  const openAuth = (target = "learning", mode = "learner") => {
    setAuthTarget(target);
    setAuthMode(mode);
    setShowAuth(true);
  };

  const requestPage = (target) => {
    if (target === "learning" && !session) {
      setPage("learning");
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    setPage(target);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const onLogin = (payload) => {
    if (payload.role === "team") {
      const found = state.team.find((t) => t.teamId === payload.teamId && t.password === payload.password);
      if (!found) return showToast("Invalid Team ID or password.");
      const s = { role: "team", ...found };
      setSession(s);
      localStorage.setItem(LS.session, JSON.stringify(s));
      setPage(authTarget === "team" ? "team" : authTarget);
      setShowAuth(false);
      return;
    }
    if (!payload.email || !payload.password) return showToast("Enter email and password, or use Google.");
    const found = state.learners.find((l) => l.email === payload.email) || { id: uid("learner"), name: payload.name, email: payload.email, password: payload.password };
    const learners = state.learners.some((l) => l.email === payload.email) ? state.learners : [found, ...state.learners];
    setState((prev) => ({ ...prev, learners }));
    const s = { role: "learner", ...found };
    setSession(s);
    localStorage.setItem(LS.session, JSON.stringify(s));
    setPage(authTarget === "team" ? "team" : authTarget);
    setShowAuth(false);
  };

  const onGoogleLogin = async () => {
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser) return;
      const learner = {
        id: googleUser.uid,
        role: "learner",
        name: googleUser.displayName || "Learner",
        email: googleUser.email || "",
        password: "",
        google: true,
      };
      const learners = state.learners.some((l) => l.email === learner.email) ? state.learners : [learner, ...state.learners];
      setState((prev) => ({ ...prev, learners }));
      setSession(learner);
      localStorage.setItem(LS.session, JSON.stringify(learner));
      setPage(authTarget === "team" ? "team" : authTarget);
      setShowAuth(false);
      showToast("Google login successful.");
    } catch (err) {
      showToast(err.message || "Google login failed.");
    }
  };

  const submitInquiry = (form) => {
    const inquiry = { id: uid("inq"), ...form, status: "New" };
    setState((prev) => ({ ...prev, inquiries: [inquiry, ...prev.inquiries] }));
    setShowInquiry(false);
    showToast("Inquiry submitted. Discovery and WhatsApp options are ready.");
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`site-shell ${showAuth ? "site-shell--blurred" : ""}`}>
        <Toast msg={toast.msg} show={toast.show} />
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
              <img src={LOGO_URL} alt={COMPANY_NAME} className="nav-logo-img" />
              <span className="nav-logo-text">{COMPANY_NAME.toUpperCase()}</span>
            </div>
            <div className="nav-links">
              {nav.map((item) => <NavButton key={item} active={page.toLowerCase() === item.toLowerCase()} onClick={() => requestPage(item.toLowerCase())}>{item}</NavButton>)}
            </div>
            <div className="nav-actions">
              <button className="nav-login" onClick={() => openAuth("learning", "learner")}>Login</button>
              <button className="nav-cta" onClick={() => setShowInquiry(true)}>Start Project</button>
            </div>
          </div>
        </nav>

        {session?.role === "team" && page === "team" ? (
          <div className="page">
            <TeamDashboard user={session} state={state} setState={setState} onBack={() => setPage("home")} />
          </div>
        ) : page === "learning" ? (
          <div className="page" key="learning-page">
            <LearningPage user={session?.role === "learner" ? session : null} courses={state.courses.filter((c) => c.published)} onBack={() => setPage("home")} />
          </div>
        ) : page === "services" ? (
          <div className="page"><ServiceGrid onPick={(svc) => { setSelectedService(svc); setPage("service"); }} /></div>
        ) : page === "service" ? (
          <div className="page"><ServiceDetail title={selectedService} onBack={() => setPage("services")} onInquiry={(svc) => { setSelectedService(svc); setShowInquiry(true); }} /></div>
        ) : page === "portfolio" ? (
          <div className="page"><PortfolioSection portfolioItems={state.portfolio} standalone isTeam={false} /></div>
        ) : page === "testimonials" ? (
          <div className="page"><TestimonialsSection testimonials={state.testimonials} user={null} /></div>
        ) : page === "process" ? (
          <div className="page"><ProcessSection /></div>
        ) : page === "contact" ? (
          <div className="page" ref={contactRef}>
            <section className="section" id="contact">
              <div className="section-inner">
                <SectionHeader label="CONTACT" title="Start the Conversation" sub="Clients can submit a requirement, book a discovery call, or chat on WhatsApp after inquiry." />
                <div className="category-grid">
                  <div className="category-card">
                    <h3>Discovery Call</h3>
                    <p>Use the inquiry form to unlock the next step.</p>
                    <a className="btn-ghost" href={settings.bookingUrl} target="_blank" rel="noreferrer" style={{ marginTop: 16, display: "inline-flex" }}>Book Call</a>
                  </div>
                  <div className="category-card">
                    <h3>WhatsApp</h3>
                    <p>{settings.whatsappNumber}</p>
                    <a className="btn-primary" href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ marginTop: 16, display: "inline-flex" }}>Chat Now</a>
                  </div>
                  <div className="category-card">
                    <h3>Email</h3>
                    <p>assetwebermail@gmail.com</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="page">
            <Hero onStartProject={() => setShowInquiry(true)} />
            <div className="marquee">
              <div className="marquee-track">
                {["WEB DEVELOPMENT", "MOBILE APPS", "AI SOLUTIONS", "VIDEO EDITING", "CONTENT CREATION", "BRANDING", "AUTOMATION"].flatMap((w) => [`${w} ·`, `${w} ·`]).map((w, i) => <span key={i}>{w}</span>)}
              </div>
            </div>
            <section className="section stats-section" style={{ padding: 0 }}>
              <div className="stats-grid">
                <div className="stat-item"><div><span className="stat-num">7</span></div><div className="stat-label">Core Services</div></div>
                <div className="stat-item"><div><span className="stat-num">1</span></div><div className="stat-label">Learner Account Type</div></div>
                <div className="stat-item"><div><span className="stat-num">2</span></div><div className="stat-label">Login Systems</div></div>
                <div className="stat-item"><div><span className="stat-num">100%</span></div><div className="stat-label">Team-Controlled Admin</div></div>
              </div>
            </section>
            <ServiceGrid onPick={(svc) => { setSelectedService(svc); setPage("service"); }} />
            <PortfolioSection portfolioItems={state.portfolio} onStartProject={() => setShowInquiry(true)} standalone />
            <section className="section"><div className="section-inner"><SectionHeader label="LEARNING" title="Public Learner Platform" sub="Learners can browse courses after sign in, watch videos, continue learning, and track progress." /><button className="btn-primary" style={{ marginTop: 24 }} onClick={() => requestPage("learning")}>Open Learning</button></div></section>
            <ProcessSection />
            <TestimonialsSection testimonials={state.testimonials} user={null} />
            <Footer />
          </div>
        )}
      </div>

      {showInquiry && <InquiryModal initialService={selectedService || "Web Development"} onClose={() => setShowInquiry(false)} onSubmit={submitInquiry} settings={settings} />}
      {showAuth && <LoginPage mode={authMode} onLogin={onLogin} onGoogleLogin={onGoogleLogin} onClose={() => setShowAuth(false)} />}
    </>
  );
}
