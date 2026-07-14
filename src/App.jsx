import { useState, useRef } from "react";
import { styles } from "./styles/globalStyles.js";
import { NAV_LINKS, NAV_PAGE_MAP, LOGO_URL, SERVICES, mergePortfolioForService, mergeAllPortfolio, COMPANY_NAME, SERVICE_OPTIONS } from "./data/siteData.js";
import {
  Toast, StatItem, Hero, ServicesSection, ServiceDetailPage, PortfolioSection,
  ProcessSection, WhyUsSection, IndustriesSection, PricingSection, EstimatorSection, TestimonialsSection,
  MultiStepForm, FeedbackForm, CtaBand, Footer,
  ExploreSkillsSection, LearningJourneySection, LearningDashboardPreviewSection,
  SkillCategoriesSection, ProjectBasedLearningSection, FreelancerJourneySection,
  FreelancerProfilePreviewSection, WhyClientsSection, CommunitySection, FinalCtaSection,
  LoginPage
} from "./components/index.jsx";

export default function BuildbigPlatform(){
  const [page, setPage] = useState("home");
  const [activeService, setActiveService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [testimonials, setTestimonials] = useState([
    {id:"t1",name:"Aarav Mehta",biz:"Founder, Studio Arc",quote:"The team delivered cinematic quality that matched our brand perfectly.",tag:"Video Editing",result:"Higher retention",initials:"AM"},
    {id:"t2",name:"Priya Sharma",biz:"Cafe Owner",quote:"Our landing page now feels premium and converts better.",tag:"Web Development",result:"More inquiries",initials:"PS"},
  ]);
  const [user, setUser] = useState(null);
  const [portForm, setPortForm] = useState({title:"",service:"Video Editing",description:"",client:"",outcome:""});
  const [portMedia, setPortMedia] = useState(null);
  const [toast, setToast] = useState({msg:"",show:false});
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast({msg,show:true});
    toastTimer.current = setTimeout(() => setToast((t) => ({...t,show:false})), 3200);
  };

  const [prefillPlan, setPrefillPlan] = useState(null);

  const handleStartProject = (plan = null) => {
    setPrefillPlan(plan?.name ? plan : null);
    setShowForm(true);
    showToast("We’ll help you shape the right project path.");
  };

  const handleDeletePortfolio = async (id) => {
    setPortfolioItems((items) => items.filter((p) => p.id !== id));
    showToast("Portfolio item deleted.");
  };

  const handleAddPortfolio = async () => {
    if(!portForm.title || !portForm.description) return showToast("Title and description are required.");
    const item = { id:`portfolio_${Date.now()}`, ...portForm, mediaUrl: portMedia ? URL.createObjectURL(portMedia) : "" };
    setPortfolioItems((items) => [item, ...items]);
    setPortForm({title:"",service:"Video Editing",description:"",client:"",outcome:""});
    setPortMedia(null);
    setShowPortForm(false);
    showToast("Portfolio item added!");
  };

  const handleServiceClick = (svc) => {
    setActiveService(svc);
    setPage("service");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleNavClick = (navItem) => {
    const map = {
      Services: "services-list",
      Process: "process",
      Pricing: "pricing",
      Portfolio: "portfolio",
      Projects: "projects",
      Testimonials: "testimonials",
    };
    setPage(map[navItem] || "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginClick = () => {
    setPage("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openPortfolioForm = (serviceTitle = "Video Editing") => {
    setPortForm((f) => ({ ...f, service: serviceTitle }));
    setShowPortForm(true);
  };

  return(
    <>
      <style>{styles}</style>
      <Toast msg={toast.msg} show={toast.show}/>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" style={{cursor:"pointer"}} onClick={() => setPage("home")}>
            <img src={LOGO_URL} alt={COMPANY_NAME} className="nav-logo-img"/>
            <span className="nav-logo-text">{COMPANY_NAME.toUpperCase()}</span>
          </div>
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <button key={l} className={`nav-link ${NAV_PAGE_MAP[l]?.includes(page) ? "active" : ""}`} onClick={() => handleNavClick(l)}>
                {l}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <button className="nav-login" onClick={handleLoginClick}>Login</button>
            <button className="nav-cta" onClick={() => handleStartProject()}>Start Project</button>
          </div>
        </div>
      </nav>

      {page === "services-list" && (
        <div className="page">
          <section className="section">
            <div className="section-inner">
              <button className="service-page-back" onClick={() => setPage("home")}>← Back to Home</button>
              <div className="section-label">OUR SERVICES</div>
              <h1 className="section-title">Everything Your Business Needs to Grow</h1>
              <p className="section-sub">Click on any service to explore our portfolio and start your project.</p>
              <div className="services-grid" style={{marginTop:48}}>
                {SERVICES.map((s) => (
                  <button className="svc-card" key={s.title} onClick={() => handleServiceClick(s)}>
                    <div className="svc-icon">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span className="svc-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {page === "service" && activeService && (
        <ServiceDetailPage
          service={activeService}
          onBack={() => setPage("services-list")}
          onStartProject={handleStartProject}
          portfolioItems={mergePortfolioForService(activeService.title, portfolioItems)}
          isTeam={false}
          onAddPortfolio={() => openPortfolioForm(activeService.title)}
          onDeletePortfolio={handleDeletePortfolio}
        />
      )}

      {page === "process" && (
        <div className="page">
          <ProcessSection/>
          <WhyUsSection/>
        </div>
      )}

      {page === "pricing" && (
        <div className="page">
          <PricingSection onStartProject={handleStartProject}/>
        </div>
      )}

      {page === "portfolio" && (
        <div className="page">
          <PortfolioSection
            standalone
            onStartProject={handleStartProject}
            portfolioItems={mergeAllPortfolio(portfolioItems)}
            isTeam={false}
            onAddPortfolio={() => openPortfolioForm("Video Editing")}
            onDeletePortfolio={handleDeletePortfolio}
          />
        </div>
      )}

      {page === "testimonials" && (
        <div className="page">
          <TestimonialsSection testimonials={testimonials} onAddFeedback={() => setShowFeedback(true)} user={null}/>
          <CtaBand onStartProject={handleStartProject}/>
        </div>
      )}

      {page === "projects" && (
        <div className="page">
          <section className="section">
            <div className="section-inner">
              <button className="service-page-back" onClick={() => setPage("home")}>← Back to Home</button>
              <div className="section-label">GET PROJECTS</div>
              <h1 className="section-title">Pick a Path, Build Real Work</h1>
              <p className="section-sub">Everything here is moved off the landing page and grouped into one dedicated place for learning and project challenges.</p>
            </div>
          </section>
          <ExploreSkillsSection />
          <LearningJourneySection />
          <LearningDashboardPreviewSection />
          <SkillCategoriesSection />
          <ProjectBasedLearningSection />
          <FreelancerJourneySection />
          <CtaBand onStartProject={handleStartProject}/>
        </div>
      )}

      {page === "login" && (
        <div className="page">
          <LoginPage onLogin={(nextUser) => { setUser(nextUser); setPage("home"); showToast("Signed in successfully."); }} />
        </div>
      )}

      {page === "learning" && (
        <div className="page">
          <section className="section">
            <div className="section-inner">
              <button className="service-page-back" onClick={() => setPage("home")}>← Back to Home</button>
              <div className="section-label">START LEARNING</div>
              <h1 className="section-title">Learn Premium Skills That Create Income</h1>
              <p className="section-sub">Search the skill you want to learn and build a path toward high-paying work.</p>
              <div className="field" style={{maxWidth:520, marginTop:28}}>
                <label>Search Skill</label>
                <input placeholder="Search Video Editing, UI/UX, Web Development..." />
              </div>
            </div>
          </section>
          <ExploreSkillsSection />
          <LearningJourneySection />
          <LearningDashboardPreviewSection />
          <SkillCategoriesSection />
        </div>
      )}

      {page === "home" && (
        <div className="page">
          <Hero
            onStartProject={handleStartProject}
            onExploreSkills={() => scrollToSection("skill-explorer")}
            onBecomeFreelancer={() => scrollToSection("freelancer-journey")}
          />
          <div className="marquee">
            <div className="marquee-track">
              {["VIDEO EDITING","VFX","WEB DEVELOPMENT","APP DEVELOPMENT","GAME DEVELOPMENT","MARKETING","CONTENT CREATION","BRANDING"].flatMap((w) => [`${w} ·`, `${w} ·`]).map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
          <section className="section stats-section" style={{padding:"0"}}>
            <div className="stats-grid">
              <StatItem value={50} suffix="+" label="Projects Delivered"/>
              <StatItem value={98} suffix="%" label="Client Retention Rate"/>
              <StatItem value={1} suffix="K" label="Social Followers Generated" onClick={() => { setPage("testimonials"); window.scrollTo({top:0,behavior:"smooth"}); }}/>
              <StatItem value={4} suffix=".9★" label="Average Client Rating"/>
            </div>
          </section>
          <section className="section">
            <div className="section-inner">
              <div className="section-label">START LEARNING</div>
              <h2 className="section-title">Learn Premium Skills That Create Income</h2>
              <p className="section-sub">High-paying creative and technical skills start here. Open the learning page to search by skill.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={() => setPage("learning")}>Go to Learning Page</button>
            </div>
          </section>
          <FreelancerProfilePreviewSection />
          <WhyClientsSection />
          <CommunitySection />
          <FinalCtaSection />
          <ServicesSection onServiceClick={handleServiceClick}/>
          <PortfolioSection onStartProject={handleStartProject} standalone={true} />
          <WhyUsSection/>
          <IndustriesSection/>
          <EstimatorSection/>
          <CtaBand onStartProject={handleStartProject}/>
          <Footer/>
        </div>
      )}

      {showForm && <MultiStepForm onClose={() => setShowForm(false)} onToast={showToast} user={null} onProjectCreated={() => { showToast("Thanks! Your brief is ready. We’ll review it shortly."); setShowForm(false); }} prefillPlan={prefillPlan}/>} 
      {showPortForm && (
        <div className="msf-backdrop">
          <div className="msf-modal" style={{maxWidth:640}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 className="bn" style={{fontSize:"1.8rem"}}>Add Portfolio</h2>
              <button onClick={() => setShowPortForm(false)} style={{border:"1px solid var(--line2)",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div className="msf-grid">
              <div className="field"><label>Title *</label><input value={portForm.title} onChange={(e) => setPortForm((f) => ({...f,title:e.target.value}))} placeholder="Project title"/></div>
              <div className="field"><label>Service</label>
                <select value={portForm.service} onChange={(e) => setPortForm((f) => ({...f,service:e.target.value}))}>
                  {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Description *</label><textarea value={portForm.description} onChange={(e) => setPortForm((f) => ({...f,description:e.target.value}))} placeholder="What was the project about?"/></div>
            <div className="msf-grid">
              <div className="field"><label>Client</label><input value={portForm.client} onChange={(e) => setPortForm((f) => ({...f,client:e.target.value}))} placeholder="Client name"/></div>
              <div className="field"><label>Key Outcome</label><input value={portForm.outcome} onChange={(e) => setPortForm((f) => ({...f,outcome:e.target.value}))} placeholder="e.g. 2x Revenue"/></div>
            </div>
            <div className="field"><label>Upload Media</label>
              <div className="drop-zone" style={{position:"relative"}}>
                <div style={{fontSize:"2rem",marginBottom:8}}>📤</div>
                <div style={{fontSize:".88rem",color:"var(--muted)"}}>Click to upload video or image</div>
                <input type="file" accept="video/*,image/*" style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}} onChange={(e) => setPortMedia(e.target.files?.[0] || null)}/>
              </div>
            </div>
            <button className="btn-primary" style={{width:"100%"}} onClick={handleAddPortfolio}>Add to Portfolio ✓</button>
          </div>
        </div>
      )}

      {showFeedback && (
        <FeedbackForm
          user={null}
          onSubmit={(fb) => {
            setTestimonials((prev) => [fb, ...prev]);
            showToast("Thank you for your feedback! It will appear on our testimonials page.");
            setShowFeedback(false);
          }}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
