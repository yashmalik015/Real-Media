import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { styles } from "./styles/globalStyles.js";
import { COMPANY_NAME, LOGO_URL, PUBLIC_SERVICES, SERVICE_OPTIONS } from "./data/siteData.js";
import { Hero, Footer, Toast, ProcessSection } from "./components/index.jsx";
import { signInWithGoogle, handleGoogleRedirectResult, logoutFirebase } from "./firebase.js";
import { api, mediaUrl, getToken, setToken } from "./api.js";

import { OSBootLoader } from "./components/futuristic/OSBootLoader.jsx";
import { FuturisticCursor } from "./components/futuristic/FuturisticCursor.jsx";
import { FuturisticBackground } from "./components/futuristic/FuturisticBackground.jsx";
import { FuturisticNavbar } from "./components/futuristic/FuturisticNavbar.jsx";
import { FuturisticHero } from "./components/futuristic/FuturisticHero.jsx";
import { HolographicServices } from "./components/futuristic/HolographicServices.jsx";
import { FuturisticPortfolio } from "./components/futuristic/FuturisticPortfolio.jsx";
import { LearningPlatformHUD } from "./components/futuristic/LearningPlatformHUD.jsx";
import { FuturisticPipeline } from "./components/futuristic/FuturisticPipeline.jsx";
import { HolographicTestimonials } from "./components/futuristic/HolographicTestimonials.jsx";
import { FuturisticPricing } from "./components/futuristic/FuturisticPricing.jsx";
import { CommandCenterContact } from "./components/futuristic/CommandCenterContact.jsx";
import { FuturisticFooter } from "./components/futuristic/FuturisticFooter.jsx";

// ── Helpers ──────────────────────────────────────────────────────────────────
function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

const serviceSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ── Nav ──────────────────────────────────────────────────────────────────────
function NavButton({ active, children, onClick }) {
  return <button className={`nav-link ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label, title, sub }) {
  return (
    <>
      <div className="section-label">{label}</div>
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ h = 120, radius = 16 }) {
  return (
    <div style={{
      height: h, borderRadius: radius,
      background: "linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "skeletonShimmer 1.6s infinite",
    }} />
  );
}

// ── Empty state card ──────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{
      textAlign: "center", padding: "64px 24px",
      border: "1px dashed rgba(255,255,255,.12)", borderRadius: 24,
      color: "var(--muted)", gridColumn: "1/-1",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 8, color: "rgba(255,255,255,.7)" }}>{title}</div>
      {sub && <div style={{ fontSize: ".88rem", lineHeight: 1.7, marginBottom: action ? 24 : 0 }}>{sub}</div>}
      {action && <button className="btn-primary" style={{ marginTop: 8 }} onClick={onAction}>{action}</button>}
    </div>
  );
}

// ── Service grid ──────────────────────────────────────────────────────────────
function ServiceGrid({ onPick }) {
  return (
    <section className="section" id="services">
      <div className="section-inner">
        <SectionHeader
          label="OUR SERVICES"
          title="Agency Operations and Learning"
          sub="Premium execution across video, web, apps, marketing, design, VFX, and games."
        />
        <div className="services-grid">
          {PUBLIC_SERVICES.map((s) => (
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

// ── Service detail ────────────────────────────────────────────────────────────
const SERVICE_PRICING = {
  "Video Editing": [{ name: "Short Form — Basic", price: "₹1,500" }, { name: "Short Form — Professional", price: "₹2,500" }, { name: "Short Form — Cinematic", price: "₹5,000+" }, { name: "Long Form — Podcast Editing", price: "₹2,000+" }, { name: "Long Form — Documentary", price: "₹6,000+" }, { name: "Commercial Ads", price: "Custom Quote" }],
  "Web Development": [{ name: "Landing Page", price: "₹24,999+" }, { name: "Business Website", price: "₹49,999+" }, { name: "Ecommerce Store", price: "₹99,999+" }],
  "App Development": [{ name: "MVP App", price: "₹1,99,999+" }, { name: "Production App", price: "₹3,49,999+" }, { name: "Enterprise App", price: "Custom Quote" }],
};

function ServiceDetail({ title, onBack, onInquiry, portfolio, loading }) {
  const service = PUBLIC_SERVICES.find((s) => s.title === title);
  const work = useMemo(() => portfolio.filter((item) => item.service === title), [portfolio, title]);
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
        <div style={{ marginTop: 72 }}>
          <SectionHeader label="PRICING" title={`${title} Plans`} sub="Transparent starting points. Every scope is confirmed before production begins." />
          <div className="pricing-grid" style={{ marginTop: 36 }}>
            {(SERVICE_PRICING[title] || [{ name: "Starter", price: "Custom Quote" }, { name: "Professional", price: "Custom Quote" }, { name: "Premium", price: "Custom Quote" }]).map((plan) => <div className="pricing-card" key={plan.name}><div className="pricing-plan">{title}</div><div className="pricing-name">{plan.name}</div><div className="pricing-price"><div className="pricing-amount">{plan.price}</div></div><button className="pricing-cta secondary" onClick={() => onInquiry(title)}>Get Started</button></div>)}
          </div>
        </div>
        <div style={{ marginTop: 72 }}>
          <SectionHeader label="OUR WORK" title={`Selected ${title} Work`} sub="Projects are published directly by our team." />
          {loading ? <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 36 }}><Skeleton h={280} /><Skeleton h={280} /><Skeleton h={280} /></div> : work.length ? <div className="portfolio-grid" style={{ marginTop: 36 }}>{work.map((item) => <PortfolioCard key={item.id} item={item} onStartProject={() => onInquiry(title)} />)}</div> : <div style={{ display: "grid", marginTop: 36 }}><EmptyState icon="🎬" title={`No ${title} projects published yet.`} sub="Check back soon for new work from our team." /></div>}
        </div>
      </div>
    </section>
  );
}

// ── Inquiry / Start Project Modal ─────────────────────────────────────────────
function InquiryModal({ initialService, onClose, settings, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", service: initialService || "", budget: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email) { showToast("Please enter your name and email."); return; }
    setLoading(true);
    try {
      await api.submitInquiry(form);
      setDone(true);
    } catch (e) {
      showToast(e.message || "Failed to submit. Please try WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="msf-backdrop">
        <div className="msf-modal" style={{ textAlign: "center", maxWidth: 520 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>✅</div>
          <h2 className="bn" style={{ fontSize: "2rem", marginBottom: 12 }}>Inquiry Received!</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.75, marginBottom: 28 }}>
            Thank you, {form.name}. We'll review your project requirements and get back to you within 24 hours.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a className="btn-ghost" href={settings?.bookingUrl || "https://calendly.com/"} target="_blank" rel="noreferrer">📅 Book Discovery Call</a>
            <a className="btn-primary" href={`https://wa.me/${(settings?.whatsappNumber || "+919416085060").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">💬 Chat on WhatsApp</a>
          </div>
          <button className="service-page-back" style={{ marginTop: 24 }} onClick={onClose}>Close ✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="msf-backdrop">
      <div className="msf-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="bn" style={{ fontSize: "1.8rem" }}>Start Your Project</h2>
          <button onClick={onClose} className="service-page-back">✕</button>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
          <div className="field"><label>Email *</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
          <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
        </div>
        <div className="msf-grid">
          <div className="field"><label>Service Required</label>
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="">Select a service...</option>
              {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>Budget</label><input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. ₹50,000" /></div>
        </div>
        <div className="field"><label>Project Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project goals, target audience, and any references..." /></div>
        <button className="btn-primary" onClick={submit} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Submitting…" : "Submit Inquiry ✓"}
        </button>
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn-ghost" href={settings?.bookingUrl || "https://calendly.com/"} target="_blank" rel="noreferrer">Book a Discovery Call</a>
          <a className="btn-primary" href={`https://wa.me/${(settings?.whatsappNumber || "+919416085060").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onLogin, onGoogleLogin, onClose }) {
  const [tab, setTab] = useState("learner");
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "", teamId: "", teamPass: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (tab === "team") {
        await onLogin({ role: "team", teamId: form.teamId, password: form.teamPass });
      } else {
        await onLogin({ role: "learner", name: form.name, email: form.email, password: form.password, mode });
      }
    } catch (e) {
      setErr(e.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setGLoading(true);
    try {
      await onGoogleLogin();
    } catch (e) {
      setErr(e.message || "Google Sign-In failed.");
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card login-card--wide">
        <button className="login-close" onClick={onClose}>✕</button>
        <div className="login-hero">
          <img src={LOGO_URL} alt={COMPANY_NAME} className="login-logo" />
          <div className="bn login-title">{COMPANY_NAME.toUpperCase()}</div>
          <p className="login-copy">One entry point, two secure paths. Learners join with email or Google. Team access stays private.</p>
        </div>
        <div className="login-tabs">
          <button className={`login-tab ${tab === "learner" ? "active" : ""}`} onClick={() => { setTab("learner"); setErr(""); }}>Learner</button>
          <button className={`login-tab ${tab === "team" ? "active" : ""}`} onClick={() => { setTab("team"); setErr(""); }}>Team</button>
        </div>
        {tab === "learner" ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button className={`est-opt ${mode === "login" ? "sel" : ""}`} onClick={() => setMode("login")}>Login</button>
              <button className={`est-opt ${mode === "register" ? "sel" : ""}`} onClick={() => setMode("register")}>Register</button>
            </div>
            {mode === "register" && <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>}
            <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={submit} disabled={loading || gLoading}>{loading ? "…" : mode === "register" ? "Create Account" : "Login"}</button>
            <div className="divider">or</div>
            <button className="google-btn" onClick={handleGoogle} disabled={loading || gLoading}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              {gLoading ? "Authenticating with Google..." : "Continue with Google"}
            </button>
          </>
        ) : (
          <>
            <div className="field"><label>Team ID</label><input value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} placeholder="10-digit Team ID" /></div>
            <div className="field"><label>Password</label><input type="password" value={form.teamPass} onChange={(e) => setForm({ ...form, teamPass: e.target.value })} placeholder="Team password" /></div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={submit} disabled={loading}>{loading ? "…" : "Enter Team Workspace"}</button>
          </>
        )}
        {err && <div style={{ background: "rgba(229,57,53,.12)", border: "1px solid rgba(229,57,53,.35)", borderRadius: 12, padding: "10px 14px", fontSize: ".86rem", color: "#fca5a5", marginTop: 14 }}>{err}</div>}
      </div>
    </div>
  );
}

// ── Learner Profile Page ──────────────────────────────────────────────────────
function LearnerProfilePage({ user, onBack, showToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bio: "", skills: "", github: "", linkedin: "", portfolioLink: "", availability: "available" });
  const [completedCourses, setCompletedCourses] = useState(0);
  const photoRef = useRef(null);
  const resumeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getLearnerProfile();
        setProfile(data.profile);
        setCompletedCourses(data.completedCourses || 0);
        setForm({
          bio: data.profile?.bio || "",
          skills: Array.isArray(data.profile?.skills) ? data.profile.skills.join(", ") : "",
          github: data.profile?.github || "",
          linkedin: data.profile?.linkedin || "",
          portfolioLink: data.profile?.portfolioLink || "",
          availability: data.profile?.availability || "available",
        });
      } catch {
        showToast("Could not load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const save = async () => {
    setSaving(true);
    try {
      const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
      const updated = await api.updateLearnerProfile({ ...form, skills });
      setProfile(updated.profile);
      showToast("Profile saved.");
    } catch (e) {
      showToast(e.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("photo", file);
    try {
      const { profile: p } = await api.uploadProfilePhoto(fd);
      setProfile(p); showToast("Photo updated.");
    } catch { showToast("Photo upload failed."); }
  };

  const uploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("resume", file);
    try {
      const { profile: p } = await api.uploadResume(fd);
      setProfile(p); showToast("Resume uploaded.");
    } catch { showToast("Resume upload failed."); }
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="section-inner">
        <button className="service-page-back" onClick={onBack}>← Back</button>
        <SectionHeader label="LEARNER PROFILE" title="Your Profile" sub="Build your professional identity. Verified profiles get matched with real client opportunities." />

        {loading ? (
          <div style={{ display: "grid", gap: 16, marginTop: 40 }}>
            {[1,2,3].map(i => <Skeleton key={i} h={80} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, marginTop: 48, alignItems: "start" }}>
            {/* Left – avatar + stats */}
            <div>
              <div style={{ border: "1px solid rgba(229,57,53,.24)", borderRadius: 24, padding: 28, background: "linear-gradient(145deg,rgba(14,14,16,.95),rgba(4,4,6,.98))" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
                  {profile?.photo ? (
                    <img src={mediaUrl(profile.photo)} alt={user?.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(229,57,53,.5)" }} />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg,var(--red),var(--red-dark))", display: "grid", placeItems: "center", fontSize: "2rem", fontFamily: "'Bebas Neue',sans-serif" }}>{initials}</div>
                  )}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: ".06em" }}>{user?.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".84rem" }}>{user?.email}</div>
                  </div>
                  <button className="btn-ghost" style={{ fontSize: ".82rem", padding: "8px 16px" }} onClick={() => photoRef.current?.click()}>📷 Change Photo</button>
                  <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    { label: "Completed Courses", value: completedCourses },
                    { label: "Profile Status", value: profile?.bio ? "✅ Complete" : "⚠️ Incomplete" },
                    { label: "Availability", value: form.availability === "available" ? "🟢 Available" : "🔴 Unavailable" },
                  ].map(stat => (
                    <div key={stat.label} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "12px 16px", background: "rgba(255,255,255,.03)" }}>
                      <div style={{ color: "var(--muted)", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{stat.label}</div>
                      <div style={{ fontWeight: 600 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <button className="btn-ghost" style={{ width: "100%", fontSize: ".82rem" }} onClick={() => resumeRef.current?.click()}>📄 {profile?.resumeUrl ? "Update Resume" : "Upload Resume"}</button>
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={uploadResume} />
                  {profile?.resumeUrl && (
                    <a href={mediaUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" className="btn-ghost" style={{ width: "100%", marginTop: 8, display: "flex", justifyContent: "center", fontSize: ".82rem" }}>View Resume →</a>
                  )}
                </div>
              </div>
            </div>

            {/* Right – edit form */}
            <div style={{ border: "1px solid var(--line2)", borderRadius: 24, padding: 28, background: "rgba(10,10,12,.8)" }}>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: ".06em", marginBottom: 24 }}>Edit Profile</h3>
              <div className="field">
                <label>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell clients and the team about yourself — your skills, experience, and goals..." style={{ minHeight: 120 }} />
              </div>
              <div className="field">
                <label>Skills (comma-separated)</label>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Video Editing, Motion Graphics, Web Development" />
              </div>
              <div className="msf-grid">
                <div className="field">
                  <label>GitHub</label>
                  <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/username" />
                </div>
                <div className="field">
                  <label>LinkedIn</label>
                  <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
              <div className="field">
                <label>Portfolio Website</label>
                <input value={form.portfolioLink} onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })} placeholder="https://yourportfolio.com" />
              </div>
              <div className="field">
                <label>Availability</label>
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                  <option value="available">🟢 Available for projects</option>
                  <option value="busy">🟡 Busy – limited availability</option>
                  <option value="unavailable">🔴 Not available right now</option>
                </select>
              </div>
              <button className="btn-primary" onClick={save} disabled={saving} style={{ marginTop: 8 }}>
                {saving ? "Saving…" : "Save Profile ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Notifications Panel ───────────────────────────────────────────────────────
function NotificationsPanel({ onClose, notifications, onMarkRead }) {
  return (
    <div style={{
      position: "fixed", top: 81, right: 16, zIndex: 300, width: 360,
      background: "linear-gradient(145deg,rgba(14,14,16,.98),rgba(4,4,6,.99))",
      border: "1px solid rgba(229,57,53,.28)", borderRadius: 22,
      boxShadow: "0 24px 80px rgba(0,0,0,.6)", padding: 20, maxHeight: "70vh", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", letterSpacing: ".06em" }}>Notifications</div>
        <div style={{ display: "flex", gap: 8 }}>
          {notifications.some(n => !n.read) && (
            <button className="btn-ghost" style={{ fontSize: ".76rem", padding: "6px 12px" }} onClick={onMarkRead}>Mark all read</button>
          )}
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line2)", borderRadius: "50%", width: 32, height: 32, display: "grid", placeItems: "center" }}>✕</button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔔</div>
          <div>No notifications yet.</div>
        </div>
      ) : notifications.map(n => (
        <div key={n.id} style={{
          border: `1px solid ${!n.read ? "rgba(229,57,53,.45)" : "var(--line)"}`,
          borderRadius: 14, padding: 14, marginBottom: 10,
          background: !n.read ? "rgba(229,57,53,.06)" : "rgba(255,255,255,.02)",
        }}>
          <div style={{ fontWeight: 500, fontSize: ".9rem", marginBottom: 4 }}>{n.title}</div>
          <div style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.6 }}>{n.message}</div>
          <div style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: 6 }}>{new Date(n.createdAt || n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// ── Global Search ─────────────────────────────────────────────────────────────
function GlobalSearch({ onClose, onNavigate }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ courses: [], portfolio: [], teachers: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setResults({ courses: [], portfolio: [], teachers: [] }); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [coursesRes, portfolioRes] = await Promise.all([
          api.searchCourses(q),
          api.getPublicPortfolio().catch(() => ({ portfolio: [] })),
        ]);
        const courses = coursesRes.courses || [];
        const portfolio = (portfolioRes.portfolio || []).filter(p =>
          p.title?.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase()) ||
          p.service?.toLowerCase().includes(q.toLowerCase())
        );
        setResults({ courses, portfolio, teachers: [] });
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }, 300);
  }, [q]);

  const total = results.courses.length + results.portfolio.length + results.teachers.length;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.88)", backdropFilter: "blur(18px)",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px 24px",
    }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses, portfolio, teachers…"
            style={{
              width: "100%", border: "1px solid rgba(229,57,53,.5)", borderRadius: 16,
              background: "rgba(14,14,16,.98)", color: "#fff", padding: "16px 56px 16px 20px",
              fontSize: "1.05rem", outline: "none",
            }}
          />
          <span style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", cursor: "pointer" }} onClick={onClose}>✕</span>
        </div>

        {loading && <div style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Searching…</div>}

        {!loading && q && total === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>No results for "{q}"</div>
        )}

        {results.courses.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: "var(--red)", fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>Courses</div>
            {results.courses.map(c => (
              <button key={c.id} style={{ display: "flex", gap: 14, alignItems: "center", width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 16px", marginBottom: 8, background: "rgba(255,255,255,.03)", cursor: "pointer", textAlign: "left" }}
                onClick={() => { onNavigate("learning"); onClose(); }}>
                {c.thumbnail ? <img src={mediaUrl(c.thumbnail)} alt={c.title} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 56, height: 40, borderRadius: 8, background: "rgba(229,57,53,.15)", display: "grid", placeItems: "center" }}>📚</div>}
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{c.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>{c.category} · {c.views || 0} views</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {results.portfolio.length > 0 && (
          <div>
            <div style={{ color: "var(--red)", fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>Portfolio</div>
            {results.portfolio.slice(0, 4).map(p => (
              <button key={p.id} style={{ display: "flex", gap: 14, alignItems: "center", width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 16px", marginBottom: 8, background: "rgba(255,255,255,.03)", cursor: "pointer", textAlign: "left" }}
                onClick={() => { onNavigate("portfolio"); onClose(); }}>
                <div style={{ width: 56, height: 40, borderRadius: 8, background: "rgba(229,57,53,.15)", display: "grid", placeItems: "center" }}>🎬</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{p.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>{p.service} · {p.client}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── YouTube-style Learning Page ────────────────────────────────────────────────
function LearningPage({ user, onBack, onOpenLesson, showToast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const searchTimer = useRef(null);

  const loadCourses = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = q ? await api.searchCourses(q) : await api.getCourses();
      setCourses(res.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const onSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadCourses(val), 300);
  };

  const categories = ["All", ...new Set((courses || []).map(c => c.category).filter(Boolean))];
  const filtered = category === "All" ? courses : courses.filter(c => c.category === category);

  // When a course is selected, go to lesson player
  if (activeCourse && activeLesson) {
    return (
      <LessonPlayer
        course={activeCourse}
        lesson={activeLesson}
        courses={courses}
        user={user}
        onBack={() => { setActiveLesson(null); setActiveCourse(null); }}
        onSelectLesson={(course, lesson) => { setActiveCourse(course); setActiveLesson(lesson); }}
        showToast={showToast}
      />
    );
  }

  const shellStyle = {
    background: "radial-gradient(ellipse at top, rgba(229,57,53,.16) 0%, transparent 38%), #030303",
    minHeight: "100vh", color: "#fff",
  };

  return (
    <section className="section learning-shell" style={shellStyle}>
      <div className="section-inner learning-shell-inner">
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <button className="service-page-back" onClick={onBack}>← Back to Home</button>
          {user && (
            <div className="learning-user-chip">
              <span className="learning-user-dot" />
              {user.name}
            </div>
          )}
        </div>

        <SectionHeader label="LEARNING" title="Course Library" sub="Browse our growing catalog of practical digital skills courses." />

        {/* Search + filter */}
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search courses…"
              style={{
                width: "100%", border: "1px solid var(--line2)", borderRadius: 999,
                background: "rgba(255,255,255,.05)", color: "#fff",
                padding: "13px 44px 13px 18px", outline: "none", fontSize: ".92rem",
              }}
            />
            <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>🔍</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button key={cat} className={`est-opt ${category === cat ? "sel" : ""}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div style={{ marginTop: 40 }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} h={260} radius={22} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "grid" }}>
              <EmptyState icon="📚" title="No courses yet." sub="The team is building amazing courses. Check back soon!" />
            </div>
          ) : (
            <>
              {/* Popular */}
              {!search && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ color: "var(--red)", fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>🔥 Popular</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                    {[...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3).map(course => (
                      <CourseCard key={course.id} course={course} onOpen={() => {
                        const firstLesson = course.modules?.[0]?.lessons?.[0];
                        if (firstLesson) { setActiveCourse(course); setActiveLesson(firstLesson); }
                      }} />
                    ))}
                  </div>
                </div>
              )}
              {/* All */}
              <div>
                <div style={{ color: "var(--muted)", fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{search ? `Results for "${search}"` : "All Courses"} · {filtered.length}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                  {filtered.map(course => (
                    <CourseCard key={course.id} course={course} onOpen={() => {
                      const firstLesson = course.modules?.[0]?.lessons?.[0];
                      if (firstLesson) { setActiveCourse(course); setActiveLesson(firstLesson); }
                    }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, onOpen }) {
  const lessonsCount = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
  return (
    <div
      className="port-card"
      style={{ cursor: "pointer" }}
      onClick={onOpen}
    >
      <div className="port-media" style={{ height: 180 }}>
        {course.thumbnail ? (
          <img src={mediaUrl(course.thumbnail)} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: "3rem", background: "linear-gradient(135deg,rgba(229,57,53,.15),rgba(0,0,0,.8))" }}>📚</div>
        )}
        <div className="port-play-btn">▶</div>
        <div className="port-tag">{course.category}</div>
      </div>
      <div className="port-body">
        <div className="port-client">{course.teacherName || "Assets Weber"}</div>
        <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem" }}>{course.title}</h3>
        <p style={{ fontSize: ".84rem", marginBottom: 12 }}>{course.description}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: ".76rem", color: "var(--muted)" }}>
          <span>📋 {lessonsCount} lessons</span>
          <span>👁 {course.views || 0} views</span>
          {course.students && <span>👥 {course.students} students</span>}
        </div>
      </div>
    </div>
  );
}

// ── Lesson Player Page ────────────────────────────────────────────────────────
function LessonPlayer({ course, lesson, courses, user, onBack, onSelectLesson, showToast }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(null);
  const lessons = course.modules?.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title }))) || [];
  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const prev = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];

  // Load comments + track progress
  useEffect(() => {
    if (!lesson.id) return;
    setLoadingComments(true);
    api.getLessonComments(lesson.id).then(res => setComments(res.comments || [])).catch(() => {}).finally(() => setLoadingComments(false));
    if (user) {
      api.trackProgress(course.id, lesson.id).then(res => setProgress(res.progress)).catch(() => {});
      api.getLessonLiked(lesson.id).then(res => setLiked(res.liked)).catch(() => {});
    }
  }, [lesson.id, user, course.id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    if (!user) { showToast("Please login to comment."); return; }
    try {
      const { comment } = await api.addComment(lesson.id, commentText.trim(), course.id);
      setComments(prev => [comment, ...prev]);
      setCommentText("");
    } catch (e) { showToast(e.message || "Comment failed."); }
  };

  const deleteComment = async (id) => {
    try {
      await api.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e) { showToast(e.message); }
  };

  const toggleLike = async () => {
    if (!user) { showToast("Please login to like."); return; }
    try {
      const { liked: newLiked } = await api.likeLesson(lesson.id);
      setLiked(newLiked);
    } catch { /* silent */ }
  };

  const shellStyle = {
    background: "radial-gradient(ellipse at top, rgba(229,57,53,.16) 0%, transparent 38%), #030303",
    minHeight: "100vh", color: "#fff", paddingTop: 0,
  };

  return (
    <section className="section learning-shell" style={shellStyle}>
      <div className="section-inner learning-shell-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <button className="service-page-back" onClick={onBack}>← Back to Courses</button>
          {user && <div className="learning-user-chip"><span className="learning-user-dot" />{user.name}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "start" }}>
          {/* Main player */}
          <div>
            {/* Video */}
            <div style={{ border: "1px solid var(--line2)", borderRadius: 24, overflow: "hidden", background: "#050505" }}>
              <div style={{ aspectRatio: "16/9" }}>
                {lesson.videoUrl ? (
                  (() => {
                    const isYT = lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be");
                    const isDrive = lesson.videoUrl.includes("drive.google.com");
                    if (isYT) {
                      const ytId = lesson.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
                      return <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen" allowFullScreen />;
                    }
                    if (isDrive) {
                      const driveId = lesson.videoUrl.match(/\/d\/([^/]+)/)?.[1];
                      return <iframe src={`https://drive.google.com/file/d/${driveId}/preview`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen" allowFullScreen />;
                    }
                    return <video src={mediaUrl(lesson.videoUrl)} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
                  })()
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".9rem" }}>
                    <div><div style={{ fontSize: "3rem", textAlign: "center", marginBottom: 12 }}>▶</div>No video uploaded yet.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Title + actions */}
            <div style={{ marginTop: 20, marginBottom: 16 }}>
              <div style={{ color: "var(--muted)", fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>{course.title} · {lesson.moduleTitle}</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2.4rem", letterSpacing: ".04em", marginBottom: 12 }}>{lesson.title}</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className={`est-opt ${liked ? "sel" : ""}`} onClick={toggleLike}>👍 {liked ? "Liked" : "Like"}</button>
                {lesson.driveLink && <a className="btn-ghost" href={lesson.driveLink} target="_blank" rel="noreferrer" style={{ fontSize: ".88rem", padding: "8px 16px" }}>📁 Google Drive</a>}
                {prev && <button className="btn-ghost" style={{ fontSize: ".88rem" }} onClick={() => onSelectLesson(course, prev)}>← Previous</button>}
                {next && <button className="btn-primary" style={{ fontSize: ".88rem" }} onClick={() => onSelectLesson(course, next)}>Next Lesson →</button>}
              </div>
            </div>

            {/* Description + Notes + Resources */}
            {lesson.description && (
              <div style={{ border: "1px solid var(--line)", borderRadius: 18, padding: 20, background: "rgba(255,255,255,.03)", marginBottom: 16 }}>
                <div className="dashboard-label">Description</div>
                <p style={{ color: "var(--muted)", lineHeight: 1.75, marginTop: 8 }}>{lesson.description}</p>
              </div>
            )}
            {lesson.notes && (
              <div style={{ border: "1px solid rgba(229,57,53,.2)", borderRadius: 18, padding: 20, background: "rgba(229,57,53,.06)", marginBottom: 16 }}>
                <div className="dashboard-label">Notes</div>
                <p style={{ color: "var(--muted2)", lineHeight: 1.75, marginTop: 8, whiteSpace: "pre-wrap" }}>{lesson.notes}</p>
              </div>
            )}
            {lesson.resources && (
              <div style={{ border: "1px solid var(--line)", borderRadius: 18, padding: 20, background: "rgba(255,255,255,.03)", marginBottom: 16 }}>
                <div className="dashboard-label">Resources</div>
                <p style={{ color: "var(--muted)", lineHeight: 1.75, marginTop: 8 }}>{lesson.resources}</p>
              </div>
            )}

            {/* Comments */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: ".06em", marginBottom: 16 }}>Comments · {comments.length}</div>
              {user && (
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--red)", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 700 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} placeholder="Add a comment…" style={{ flex: 1, border: "1px solid var(--line2)", borderRadius: 999, background: "rgba(255,255,255,.05)", color: "#fff", padding: "10px 16px", outline: "none" }} />
                  <button className="btn-primary" style={{ padding: "10px 20px", fontSize: ".88rem" }} onClick={addComment}>Post</button>
                </div>
              )}
              {loadingComments ? <Skeleton h={80} /> : comments.length === 0 ? (
                <div style={{ color: "var(--muted)", padding: "24px 0", textAlign: "center" }}>No comments yet. Be the first!</div>
              ) : comments.map(c => (
                <div key={c.id} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 16, marginBottom: 12, background: "rgba(255,255,255,.02)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,57,53,.3)", display: "grid", placeItems: "center", fontSize: ".82rem", fontWeight: 700, flexShrink: 0 }}>
                      {c.userName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{c.userName}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".76rem" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ color: "var(--muted2)", lineHeight: 1.65 }}>{c.text}</div>
                      {user?.id === c.userId && (
                        <button style={{ marginTop: 8, color: "rgba(229,57,53,.7)", fontSize: ".78rem", background: "none", border: "none", cursor: "pointer" }} onClick={() => deleteComment(c.id)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar – playlist */}
          <div style={{ position: "sticky", top: 100, border: "1px solid var(--line)", borderRadius: 24, background: "rgba(10,10,12,.9)", padding: 20, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <div className="dashboard-label">Course Playlist</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", marginBottom: 16 }}>{course.title}</div>
            {course.modules?.map(mod => (
              <div key={mod.id} style={{ marginBottom: 16 }}>
                <div style={{ color: "var(--muted)", fontSize: ".76rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>{mod.title}</div>
                {mod.lessons?.map((l, idx) => (
                  <button key={l.id} onClick={() => onSelectLesson(course, { ...l, moduleTitle: mod.title })} style={{
                    display: "flex", gap: 10, alignItems: "center", width: "100%",
                    border: "none", borderRadius: 12, padding: "10px 12px", marginBottom: 6,
                    background: l.id === lesson.id ? "rgba(229,57,53,.15)" : "transparent",
                    borderLeft: l.id === lesson.id ? "2px solid var(--red)" : "2px solid transparent",
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ color: l.id === lesson.id ? "var(--red)" : "var(--muted)", fontSize: ".76rem", minWidth: 18 }}>{idx + 1}</span>
                    <span style={{ color: l.id === lesson.id ? "#fff" : "var(--muted2)", fontSize: ".88rem", lineHeight: 1.4 }}>{l.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Team Dashboard (API-connected) ────────────────────────────────────────────
function TeamDashboard({ user, onBack, showToast, onPortfolioChanged }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [settings, setSettings] = useState({ whatsappNumber: "", bookingUrl: "" });
  const [loading, setLoading] = useState({});
  const [portForm, setPortForm] = useState({ title: "", service: "Video Editing", description: "", client: "", outcome: "" });
  const [portMedia, setPortMedia] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: "", company: "", review: "", rating: "5", service: "Video Editing" });
  const [testimonialPhoto, setTestimonialPhoto] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: "", category: "", description: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", videoUrl: "", driveLink: "", resources: "", notes: "" });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const portPhotoRef = useRef(null);
  const testimonialPhotoRef = useRef(null);
  const courseThumbnailRef = useRef(null);
  const lessonVideoRef = useRef(null);

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  const load = useCallback(async () => {
    try {
      const [analyticsRes, portfolioRes, testimonialsRes, coursesRes, inquiriesRes, settingsRes] = await Promise.all([
        api.getAnalytics().catch(() => ({ analytics: {} })),
        api.getPublicPortfolio().catch(() => ({ portfolio: [] })),
        api.getAllTestimonials().catch(() => ({ testimonials: [] })),
        api.getAllCourses().catch(() => ({ courses: [] })),
        api.getInquiries().catch(() => ({ inquiries: [] })),
        api.getSettings().catch(() => ({ settings: {} })),
      ]);
      setAnalytics(analyticsRes.analytics);
      setPortfolio(portfolioRes.portfolio || []);
      setTestimonials(testimonialsRes.testimonials || []);
      setCourses(coursesRes.courses || []);
      setInquiries(inquiriesRes.inquiries || []);
      const s = settingsRes.settings || {};
      setSettings({ whatsappNumber: s.whatsappNumber || s.whatsapp_number || "", bookingUrl: s.bookingUrl || s.booking_url || "" });
    } catch (e) {
      showToast(e.message || "Failed to load dashboard.");
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;

  const addPortfolio = async () => {
    if (!portForm.title || !portForm.description) { showToast("Title and description are required."); return; }
    setLoad("port", true);
    try {
      const fd = new FormData();
      Object.entries(portForm).forEach(([k, v]) => fd.append(k, v));
      if (portMedia) fd.append("media", portMedia);
      await api.addPortfolio(fd);
      setPortForm({ title: "", service: "Video Editing", description: "", client: "", outcome: "" });
      setPortMedia(null);
      await load();
      await onPortfolioChanged?.();
      showToast("Portfolio item added!");
    } catch (e) { showToast(e.message || "Upload failed."); } finally { setLoad("port", false); }
  };

  const deletePortfolio = async (id) => {
    if (!confirm("Delete this portfolio item?")) return;
    try { await api.deletePortfolio(id); await load(); await onPortfolioChanged?.(); showToast("Deleted."); } catch (e) { showToast(e.message); }
  };

  const saveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.review) { showToast("Name and review required."); return; }
    setLoad("testi", true);
    try {
      const fd = new FormData();
      Object.entries(testimonialForm).forEach(([k, v]) => fd.append(k, v));
      if (testimonialPhoto) fd.append("photo", testimonialPhoto);
      if (editingTestimonial) {
        await api.updateTestimonial(editingTestimonial.id, fd);
      } else {
        await api.addTestimonialManage(fd);
      }
      setTestimonialForm({ name: "", company: "", review: "", rating: "5", service: "Video Editing" });
      setTestimonialPhoto(null);
      setEditingTestimonial(null);
      await load(); showToast(editingTestimonial ? "Updated." : "Testimonial added!");
    } catch (e) { showToast(e.message || "Failed."); } finally { setLoad("testi", false); }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try { await api.deleteTestimonialManage(id); await load(); showToast("Deleted."); } catch (e) { showToast(e.message); }
  };

  const createCourse = async () => {
    if (!courseForm.title) { showToast("Title required."); return; }
    try {
      const { course } = await api.createCourse(courseForm);
      setSelectedCourseId(course.id);
      setCourseForm({ title: "", category: "", description: "" });
      await load(); showToast("Course created!");
    } catch (e) { showToast(e.message); }
  };

  const togglePublish = async (course) => {
    try {
      await api.updateCourse(course.id, { ...course, published: !course.published });
      await load();
    } catch (e) { showToast(e.message); }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    try { await api.deleteCourse(id); setSelectedCourseId(null); await load(); showToast("Deleted."); } catch (e) { showToast(e.message); }
  };

  const uploadThumbnail = async (courseId, file) => {
    const fd = new FormData(); fd.append("thumbnail", file);
    try { await api.uploadCourseThumbnail(courseId, fd); await load(); showToast("Thumbnail uploaded!"); } catch (e) { showToast(e.message); }
  };

  const addModule = async () => {
    if (!moduleTitle.trim() || !selectedCourse) return;
    const modules = [...(selectedCourse.modules || []), { id: uid("mod"), title: moduleTitle.trim(), lessons: [] }];
    try { await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules }); setModuleTitle(""); await load(); } catch (e) { showToast(e.message); }
  };

  const deleteModule = async (modId) => {
    if (!selectedCourse) return;
    const modules = selectedCourse.modules.filter(m => m.id !== modId);
    try { await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules }); await load(); } catch (e) { showToast(e.message); }
  };

  const addLesson = async (modId) => {
    if (!lessonForm.title.trim() || !selectedCourse) return;
    setLoad("lesson", true);
    try {
      let videoUrl = lessonForm.videoUrl;
      if (videoFile) {
        const fd = new FormData(); fd.append("video", videoFile);
        const { url } = await api.uploadLessonVideo(selectedCourse.id, uid("les"), fd);
        videoUrl = url;
      }
      const lesson = { id: uid("les"), ...lessonForm, videoUrl };
      const modules = selectedCourse.modules.map(m => m.id === modId ? { ...m, lessons: [...(m.lessons || []), lesson] } : m);
      await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules });
      setLessonForm({ title: "", description: "", videoUrl: "", driveLink: "", resources: "", notes: "" });
      setVideoFile(null);
      await load(); showToast("Lesson added!");
    } catch (e) { showToast(e.message); } finally { setLoad("lesson", false); }
  };

  const deleteLesson = async (modId, lessonId) => {
    if (!selectedCourse) return;
    const modules = selectedCourse.modules.map(m => m.id === modId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m);
    try { await api.updateCourse(selectedCourse.id, { ...selectedCourse, modules }); await load(); } catch (e) { showToast(e.message); }
  };

  const saveSettings = async () => {
    try { await api.updateSettings(settings); showToast("Settings saved."); } catch (e) { showToast(e.message); }
  };

  const navItems = ["dashboard", "portfolio", "courses", "testimonials", "requests", "settings"];

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={LOGO_URL} alt={COMPANY_NAME} />
          <div><div className="bn" style={{ fontSize: "1.1rem", letterSpacing: ".2em" }}>{COMPANY_NAME.toUpperCase()}</div><div style={{ color: "var(--muted)", fontSize: ".76rem" }}>Team Dashboard</div></div>
        </div>
        <button className="btn-ghost" style={{ width: "100%", marginBottom: 16 }} onClick={onBack}>Exit Dashboard</button>
        {navItems.map((k) => (
          <button key={k} className={`snav-btn ${activeNav === k ? "active" : ""}`} onClick={() => setActiveNav(k)}>
            {k === "dashboard" ? "📊" : k === "portfolio" ? "🎬" : k === "courses" ? "📚" : k === "testimonials" ? "⭐" : k === "requests" ? "📬" : "⚙️"} {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </aside>
      <div className="workspace-content">
        <div className="ws-header">
          <div className="ws-title">Team Admin</div>
          <div style={{ color: "var(--muted)" }}>Logged in as {user?.name}</div>
        </div>

        {/* Dashboard overview */}
        {activeNav === "dashboard" && (
          <div className="category-grid">
            {[
              { title: "Portfolio Items", value: analytics?.portfolioCount || portfolio.length },
              { title: "Published Courses", value: analytics?.publishedCourses || 0 },
              { title: "Total Inquiries", value: analytics?.inquiryCount || inquiries.length },
              { title: "Testimonials", value: analytics?.testimonialCount || testimonials.length },
              { title: "Course Views", value: analytics?.totalCourseViews || 0 },
              { title: "New Inquiries", value: analytics?.newInquiries || 0 },
            ].map(stat => (
              <div className="category-card" key={stat.title}>
                <h3>{stat.title}</h3>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2.4rem", color: "var(--red)", marginTop: 8 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio */}
        {activeNav === "portfolio" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>Upload Portfolio Item</h3>
              <div className="msf-grid">
                <div className="field"><label>Title *</label><input value={portForm.title} onChange={(e) => setPortForm({ ...portForm, title: e.target.value })} placeholder="Project title" /></div>
                <div className="field"><label>Service</label>
                  <select value={portForm.service} onChange={(e) => setPortForm({ ...portForm, service: e.target.value })}>
                    {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field"><label>Description *</label><textarea value={portForm.description} onChange={(e) => setPortForm({ ...portForm, description: e.target.value })} /></div>
              <div className="msf-grid">
                <div className="field"><label>Client</label><input value={portForm.client} onChange={(e) => setPortForm({ ...portForm, client: e.target.value })} /></div>
                <div className="field"><label>Key Outcome</label><input value={portForm.outcome} onChange={(e) => setPortForm({ ...portForm, outcome: e.target.value })} placeholder="e.g. 2x Revenue" /></div>
              </div>
              <div className="field"><label>Upload Media (Video / Image)</label>
                <div className="drop-zone" style={{ position: "relative" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📤</div>
                  <div style={{ fontSize: ".88rem", color: "var(--muted)" }}>{portMedia ? portMedia.name : "Click to upload"}</div>
                  <input ref={portPhotoRef} type="file" accept="video/*,image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={(e) => setPortMedia(e.target.files?.[0] || null)} />
                </div>
              </div>
              <button className="btn-primary" onClick={addPortfolio} disabled={loading.port}>{loading.port ? "Uploading…" : "Save Portfolio Item ✓"}</button>
            </div>
            {portfolio.length === 0 ? (
              <div style={{ display: "grid" }}><EmptyState icon="🎬" title="No portfolio items yet." sub="Upload your first item above." /></div>
            ) : (
              <div className="portfolio-grid">
                {portfolio.map(item => (
                  <div key={item.id} className="port-card">
                    <div className="port-media" style={{ height: 200 }}>
                      {item.mediaType === "video" && item.mediaUrl ? (
                        <video src={mediaUrl(item.mediaUrl)} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" />
                      ) : item.mediaUrl ? (
                        <img src={mediaUrl(item.mediaUrl)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: "3rem" }}>🎬</div>
                      )}
                      <div className="port-tag">{item.service}</div>
                    </div>
                    <div className="port-body">
                      <div className="port-client">{item.client}</div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <button className="btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => deletePortfolio(item.id)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Courses */}
        {activeNav === "courses" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>Create Course</h3>
              <div className="msf-grid">
                <div className="field"><label>Title *</label><input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
                <div className="field"><label>Category</label><input value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} placeholder="e.g. Web Development" /></div>
              </div>
              <div className="field"><label>Description</label><textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
              <button className="btn-primary" onClick={createCourse}>Create Course</button>
            </div>
            <div className="category-grid">
              {courses.map(course => (
                <button key={course.id} className={`category-card ${selectedCourseId === course.id ? "active" : ""}`} onClick={() => setSelectedCourseId(course.id)} style={{ textAlign: "left", cursor: "pointer" }}>
                  {course.thumbnail && <img src={mediaUrl(course.thumbnail)} alt={course.title} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} loading="lazy" />}
                  <h3>{course.title}</h3>
                  <ul>
                    <li>{course.category}</li>
                    <li>{course.published ? "✅ Published" : "⬜ Draft"}</li>
                    <li>{course.modules?.length || 0} modules</li>
                  </ul>
                </button>
              ))}
            </div>
            {selectedCourse && (
              <div className="dashboard-card" style={{ marginTop: 20 }}>
                <div className="dashboard-card-head">
                  <h3>{selectedCourse.title}</h3>
                  <span className="dashboard-pill">{selectedCourse.published ? "Published" : "Draft"}</span>
                </div>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>{selectedCourse.description}</p>
                {/* Thumbnail upload */}
                <div className="field" style={{ marginTop: 16 }}>
                  <label>Thumbnail</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {selectedCourse.thumbnail && <img src={mediaUrl(selectedCourse.thumbnail)} alt="thumb" style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8 }} />}
                    <input ref={courseThumbnailRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumbnail(selectedCourse.id, f); }} />
                    <button className="btn-ghost" style={{ fontSize: ".82rem" }} onClick={() => courseThumbnailRef.current?.click()}>📷 Upload Thumbnail</button>
                  </div>
                </div>
                <div className="profile-actions" style={{ marginTop: 14 }}>
                  <button className="btn-ghost" onClick={() => togglePublish(selectedCourse)}>{selectedCourse.published ? "Unpublish" : "Publish"}</button>
                  <button className="btn-ghost" style={{ color: "#fca5a5" }} onClick={() => deleteCourse(selectedCourse.id)}>Delete Course</button>
                </div>
                {/* Add module */}
                <div className="why-card" style={{ marginTop: 18 }}>
                  <h4>Add Module</h4>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title" style={{ flex: 1, border: "1px solid var(--line2)", borderRadius: 10, background: "rgba(255,255,255,.05)", color: "#fff", padding: "10px 14px", outline: "none" }} />
                    <button className="btn-primary" onClick={addModule}>Add</button>
                  </div>
                </div>
                {/* Modules */}
                <div className="why-grid" style={{ marginTop: 18 }}>
                  {(selectedCourse.modules || []).map((mod) => (
                    <div className="why-card" key={mod.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4>{mod.title}</h4>
                        <button className="btn-ghost" style={{ fontSize: ".78rem", color: "#fca5a5" }} onClick={() => deleteModule(mod.id)}>Delete Module</button>
                      </div>
                      {(mod.lessons || []).map((lesson) => (
                        <div key={lesson.id} className="learning-notes" style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{lesson.title}</strong>
                            <button className="btn-ghost" style={{ fontSize: ".76rem", color: "#fca5a5" }} onClick={() => deleteLesson(mod.id, lesson.id)}>Delete</button>
                          </div>
                          {lesson.description && <p style={{ marginTop: 4, color: "var(--muted)", fontSize: ".84rem" }}>{lesson.description}</p>}
                        </div>
                      ))}
                      {/* Add lesson form */}
                      <div style={{ marginTop: 14, background: "rgba(255,255,255,.03)", borderRadius: 14, padding: 16 }}>
                        <div style={{ fontSize: ".76rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Add Lesson</div>
                        <div className="field"><input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title *" /></div>
                        <div className="field"><textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Description" style={{ minHeight: 60 }} /></div>
                        <div className="field"><input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="Video URL (YouTube / Google Drive / direct)" /></div>
                        <div className="field"><input value={lessonForm.driveLink} onChange={(e) => setLessonForm({ ...lessonForm, driveLink: e.target.value })} placeholder="Google Drive resources link" /></div>
                        <div className="field"><textarea value={lessonForm.notes} onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })} placeholder="Lesson notes" style={{ minHeight: 60 }} /></div>
                        <div className="field">
                          <label>Or upload video file</label>
                          <input ref={lessonVideoRef} type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                          {videoFile && <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 4 }}>Selected: {videoFile.name}</div>}
                        </div>
                        <button className="btn-primary" onClick={() => addLesson(mod.id)} disabled={loading.lesson}>
                          {loading.lesson ? "Adding…" : "Add Lesson ✓"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Testimonials */}
        {activeNav === "testimonials" && (
          <>
            <div className="port-upload-form">
              <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h3>
              <div className="msf-grid">
                <div className="field"><label>Client Name *</label><input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} /></div>
                <div className="field"><label>Company / Role</label><input value={testimonialForm.company} onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })} /></div>
              </div>
              <div className="field"><label>Review *</label><textarea value={testimonialForm.review} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: e.target.value })} /></div>
              <div className="msf-grid">
                <div className="field"><label>Rating (1-5)</label>
                  <select value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}>
                    {["5","4","3","2","1"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field"><label>Service</label>
                  <select value={testimonialForm.service} onChange={(e) => setTestimonialForm({ ...testimonialForm, service: e.target.value })}>
                    {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Client Photo</label>
                <input ref={testimonialPhotoRef} type="file" accept="image/*" onChange={(e) => setTestimonialPhoto(e.target.files?.[0] || null)} />
                {testimonialPhoto && <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 4 }}>{testimonialPhoto.name}</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" onClick={saveTestimonial} disabled={loading.testi}>{loading.testi ? "Saving…" : editingTestimonial ? "Update ✓" : "Save ✓"}</button>
                {editingTestimonial && <button className="btn-ghost" onClick={() => { setEditingTestimonial(null); setTestimonialForm({ name: "", company: "", review: "", rating: "5", service: "Video Editing" }); }}>Cancel</button>}
              </div>
            </div>
            {testimonials.length === 0 ? (
              <div style={{ display: "grid" }}><EmptyState icon="⭐" title="No testimonials yet." sub="Add your first testimonial above." /></div>
            ) : (
              <div className="testimonials-grid">
                {testimonials.map(t => (
                  <div key={t.id} className="testi-card">
                    <div className="testi-stars">{"★".repeat(t.rating || 5)}</div>
                    <p className="testi-quote">"{t.quote}"</p>
                    <div className="testi-author">
                      {t.photo ? <img src={mediaUrl(t.photo)} alt={t.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} /> : <div className="testi-avatar">{t.initials}</div>}
                      <div><div className="testi-name">{t.name}</div><div className="testi-biz">{t.biz}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn-ghost" style={{ fontSize: ".78rem" }} onClick={() => { setEditingTestimonial(t); setTestimonialForm({ name: t.name, company: t.biz || "", review: t.quote, rating: String(t.rating || 5), service: t.tag || "Video Editing" }); setActiveNav("testimonials"); }}>Edit</button>
                      <button className="btn-ghost" style={{ fontSize: ".78rem", color: "#fca5a5" }} onClick={() => deleteTestimonial(t.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Requests / Inquiries */}
        {activeNav === "requests" && (
          <div className="dashboard-card">
            {inquiries.length === 0 ? (
              <EmptyState icon="📬" title="No inquiries yet." sub="Client inquiries submitted through the Start Project form will appear here." />
            ) : inquiries.map(inq => (
              <div key={inq.id} className="why-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h4>{inq.name}</h4>
                  <span className={`proj-status ${inq.status === "New" ? "status-new" : inq.status === "Contacted" ? "status-active" : "status-done"}`}>{inq.status}</span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 4 }}>{inq.email} · {inq.phone} · {inq.company}</p>
                <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 4 }}>{inq.service} · {inq.budget}</p>
                <p style={{ color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.6, marginBottom: 12 }}>{inq.description}</p>
                <div className="profile-actions">
                  <button className="btn-ghost" style={{ fontSize: ".82rem" }} onClick={async () => { await api.updateInquiry(inq.id, "Contacted"); await load(); }}>Mark Contacted</button>
                  <button className="btn-ghost" style={{ fontSize: ".82rem" }} onClick={async () => { await api.updateInquiry(inq.id, "Closed"); await load(); }}>Mark Closed</button>
                  <button className="btn-ghost" style={{ fontSize: ".82rem", color: "#fca5a5" }} onClick={async () => { if (confirm("Delete inquiry?")) { await api.deleteInquiry(inq.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeNav === "settings" && (
          <div className="port-upload-form">
            <h3 className="bn" style={{ fontSize: "1.4rem", marginBottom: 18 }}>Site Settings</h3>
            <div className="field"><label>WhatsApp Number</label><input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="+919416085060" /></div>
            <div className="field"><label>Discovery Call / Booking Link</label><input value={settings.bookingUrl} onChange={(e) => setSettings({ ...settings, bookingUrl: e.target.value })} placeholder="https://calendly.com/..." /></div>
            <button className="btn-primary" onClick={saveSettings}>Save Settings ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedService, setSelectedService] = useState(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioFilter, setPortfolioFilter] = useState("All");
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({ whatsappNumber: "+919416085060", bookingUrl: "https://calendly.com/" });
  const [dataLoading, setDataLoading] = useState(true);
  const toastTimer = useRef(null);

  const refreshPortfolio = useCallback(async () => {
    const result = await api.getPublicPortfolio();
    const newestFirst = [...(result.portfolio || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setPortfolio(newestFirst);
    return newestFirst;
  }, []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  }, []);

  // Restore session from token
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) { setSessionLoading(false); return; }
      try {
        const data = await api.me();
        if (data?.user) setSession(data.user);
        else setToken(null);
      } catch {
        setToken(null);
      } finally {
        setSessionLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Handle Google redirect result
  useEffect(() => {
    handleGoogleRedirectResult().then(async (res) => {
      if (!res?.idToken) return;
      try {
        const data = await api.loginGoogleLearner({ idToken: res.idToken });
        setToken(data.token);
        setSession(data.user);
        setShowAuth(false);
        setPage("learning");
        showToast("Signed in with Google.");
      } catch (e) {
        showToast(e.message || "Google login failed.");
      }
    }).catch(() => {});
  }, [showToast]);

  // Load public data (portfolio, testimonials, settings)
  useEffect(() => {
    const loadPublicData = async () => {
      setDataLoading(true);
      try {
        const [portRes, testiRes, settingsRes] = await Promise.all([
          api.getPublicPortfolio().catch(() => ({ portfolio: [] })),
          api.getTestimonials().catch(() => ({ testimonials: [] })),
          api.getSettings().catch(() => ({ settings: {} })),
        ]);
        setPortfolio([...(portRes.portfolio || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        setTestimonials(testiRes.testimonials || []);
        const s = settingsRes.settings || {};
        setSettings({
          whatsappNumber: s.whatsappNumber || s.whatsapp_number || "+919416085060",
          bookingUrl: s.bookingUrl || s.booking_url || "https://calendly.com/",
        });
      } catch { /* silent – use defaults */ } finally {
        setDataLoading(false);
      }
    };
    loadPublicData();
  }, []);

  // Keep public portfolio views current after an upload in another dashboard tab.
  useEffect(() => {
    const refresh = () => refreshPortfolio().catch(() => {});
    window.addEventListener("focus", refresh);
    window.addEventListener("portfolio:changed", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("portfolio:changed", refresh); };
  }, [refreshPortfolio]);

  useEffect(() => {
    const syncRoute = () => {
      const slug = window.location.pathname.match(/^\/services\/([^/]+)$/)?.[1];
      const service = PUBLIC_SERVICES.find((item) => serviceSlug(item.title) === slug);
      if (service) { setSelectedService(service.title); setPage("service"); }
    };
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  // Load notifications when session is learner
  useEffect(() => {
    if (!session || session.role !== "learner") return;
    api.getNotifications().then(res => setNotifications(res.notifications || [])).catch(() => {});
  }, [session]);

  const onLogin = async (payload) => {
    if (payload.role === "team") {
      const { token, user } = await api.loginTeamV2({ teamId: payload.teamId, password: payload.password });
      setToken(token);
      setSession(user);
      setShowAuth(false);
      setPage("team");
    } else {
      const { token, user } = await api.loginLearner({ name: payload.name, email: payload.email, password: payload.password, mode: payload.mode });
      setToken(token);
      setSession(user);
      setShowAuth(false);
      showToast(`Welcome${payload.mode === "register" ? " to Assets Weber" : " back"}, ${user.name}!`);
    }
  };

  const onGoogleLogin = async () => {
    const res = await signInWithGoogle();
    if (!res?.idToken) return;
    const data = await api.loginGoogleLearner({ idToken: res.idToken });
    if (!data || !data.token) {
      throw new Error(data?.message || "Google auth failed.");
    }
    setToken(data.token);
    setSession(data.user);
    setShowAuth(false);
    showToast(`Welcome back, ${data.user?.name || "Learner"}!`);
  };

  const onLogout = async () => {
    try { await api.logout(); } catch { /* silent */ }
    try { await logoutFirebase(); } catch { /* silent */ }
    setToken(null);
    setSession(null);
    setNotifications([]);
    setPage("home");
    showToast("Signed out.");
  };

  const markNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const requestPage = (target) => {
    setPage(target);
    if (window.location.pathname.startsWith("/services/")) window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openService = (title) => {
    setSelectedService(title);
    setPage("service");
    window.history.pushState({}, "", `/services/${serviceSlug(title)}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const [booting, setBooting] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredPortfolio = portfolioFilter === "All" ? portfolio : portfolio.filter((item) => item.service === portfolioFilter);

  return (
    <>
      <style>{styles}</style>
      <style>{`
        @keyframes skeletonShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .page--home { padding-top: 0 !important; }
      `}</style>

      {/* 2045 OS Booting Screen */}
      {booting && <OSBootLoader onComplete={() => setBooting(false)} />}

      {/* Futuristic 2045 Reticle Cursor & Volumetric Background */}
      <FuturisticCursor />
      <FuturisticBackground />

      <div className={`site-shell ${showAuth ? "site-shell--blurred" : ""}`}>
        <Toast msg={toast.msg} show={toast.show} />

        {/* Floating Glass 2045 HUD Navbar */}
        <FuturisticNavbar
          page={page}
          onNavigate={requestPage}
          session={session}
          onOpenAuth={() => setShowAuth(true)}
          onLogout={onLogout}
          onStartProject={() => setShowInquiry(true)}
          onOpenNotifications={() => setShowNotifications(v => !v)}
          unreadCount={unreadCount}
        />

        {/* Notification panel */}
        {showNotifications && (
          <NotificationsPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkRead={markNotificationsRead}
          />
        )}

        {/* Pages */}
        {session?.role === "team" && page === "team" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <TeamDashboard user={session} onBack={() => setPage("home")} showToast={showToast} onPortfolioChanged={async () => { await refreshPortfolio(); window.dispatchEvent(new Event("portfolio:changed")); }} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "learning" ? (
          <div className="page" key="learning-page" style={{ paddingTop: 100 }}>
            <LearningPage
              user={session?.role === "learner" ? session : null}
              onBack={() => requestPage("home")}
              showToast={showToast}
            />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "profile" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            {session?.role === "learner" ? (
              <LearnerProfilePage user={session} onBack={() => requestPage("home")} showToast={showToast} />
            ) : (
              <div className="section"><div className="section-inner"><p style={{ color: "var(--muted)" }}>Please login as a learner to view your profile.</p><button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAuth(true)}>Login</button></div></div>
            )}
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "services" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <HolographicServices onPickService={openService} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "service" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <ServiceDetail title={selectedService} portfolio={portfolio} loading={dataLoading} onBack={() => requestPage("services")} onInquiry={(svc) => { setSelectedService(svc); setShowInquiry(true); }} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "portfolio" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <FuturisticPortfolio portfolio={portfolio} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "testimonials" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <HolographicTestimonials testimonials={testimonials} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "process" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <FuturisticPipeline onStartProject={() => setShowInquiry(true)} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "contact" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <CommandCenterContact showToast={showToast} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "pricing" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <FuturisticPricing onSelectPlan={() => setShowInquiry(true)} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : (
          /* 2045 HOME OPERATING SYSTEM EXPERIENCE */
          <div className="page page--home" style={{ paddingTop: 0 }}>
            {/* 1. Next-Gen 2045 Hero Section */}
            <FuturisticHero
              onStartProject={() => setShowInquiry(true)}
              onExploreServices={() => requestPage("services")}
              onLearningClick={() => requestPage("learning")}
            />

            {/* 2. Holographic Capabilities Matrix */}
            <HolographicServices onPickService={openService} />

            {/* 3. 3D Horizontal Showcase Portfolio */}
            <FuturisticPortfolio portfolio={portfolio} />

            {/* 4. Netflix + Apple TV Style Learning HUD */}
            <LearningPlatformHUD onOpenLearning={() => requestPage("learning")} />

            {/* 5. 5-Stage Cybernetic Pipeline */}
            <FuturisticPipeline onStartProject={() => setShowInquiry(true)} />

            {/* 6. Holographic Verified Testimonials */}
            <HolographicTestimonials testimonials={testimonials} />

            {/* 7. Production Pricing Matrix */}
            <FuturisticPricing onSelectPlan={() => setShowInquiry(true)} />

            {/* 8. Command Center Contact Form */}
            <CommandCenterContact showToast={showToast} />

            {/* 9. Next-Gen Futuristic Footer */}
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} onNavigate={requestPage} />}
      {showInquiry && <InquiryModal initialService={selectedService || ""} onClose={() => setShowInquiry(false)} settings={settings} showToast={showToast} />}
      {showAuth && <LoginModal onLogin={onLogin} onGoogleLogin={onGoogleLogin} onClose={() => setShowAuth(false)} />}
    </>
  );
}

// ── Portfolio Card (standalone) ────────────────────────────────────────────────
function PortfolioCard({ item, onStartProject }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const src = item.mediaUrl ? mediaUrl(item.mediaUrl) : (item.fileUrl || "");
  const isVideo = item.mediaType === "video" || (item.mediaUrl && /\.(mp4|webm|mov)/i.test(item.mediaUrl)) || item.fileUrl;
  const desc = item.desc || item.description || "";

  return (
    <>
      <div className="port-card">
        <div className="port-media" style={{ height: 240, cursor: isVideo ? "pointer" : "default" }} onClick={isVideo ? () => setModalOpen(true) : undefined}>
          {isVideo && !videoError ? (
            <video ref={videoRef} src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} loop playsInline autoPlay muted preload="metadata"
              onCanPlay={() => videoRef.current?.play().catch(() => {})} onError={() => setVideoError(true)} />
          ) : (!isVideo && src) ? (
            <img src={src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", background: "linear-gradient(135deg,rgba(229,57,53,.15),rgba(0,0,0,.8))" }}>🎬</div>
          )}
          {isVideo && <div className="port-play-btn">⤢</div>}
          <div className="port-tag">{item.service}</div>
        </div>
        <div className="port-body">
          <div className="port-client">{item.client}</div>
          <h3>{item.title}</h3>
          <p>{desc}</p>
          {item.outcome && <div className="port-results"><span className="port-result">{item.outcome}</span></div>}
          <button className="btn-primary" style={{ width: "100%", marginTop: 14, fontSize: ".86rem" }} onClick={onStartProject}>View Project</button>
        </div>
      </div>
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setModalOpen(false)}>
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 16, zIndex: 100000 }}>
            <button onClick={(e) => { e.stopPropagation(); setModalOpen(false); }} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ maxWidth: "100%", maxHeight: "80vh", width: "100%" }} onClick={e => e.stopPropagation()}>
            {videoError ? (
              <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>Video preview failed. <a href={src} target="_blank" rel="noreferrer" style={{ color: "var(--red)" }}>Open directly →</a></div>
            ) : (
              <video src={src} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }} controls autoPlay muted playsInline preload="metadata" onError={() => setVideoError(true)} />
            )}
          </div>
          <div style={{ marginTop: 20, textAlign: "center", maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: 8, color: "#fff" }}>{item.title}</h3>
            <p style={{ color: "rgba(255,255,255,.7)" }}>{desc}</p>
          </div>
        </div>
      )}
    </>
  );
}
