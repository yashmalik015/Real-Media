import { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken } from "./api.js";
import { styles } from "./styles/globalStyles.js";
import { NAV_LINKS, NAV_PAGE_MAP, LOGO_URL, SERVICES, mergePortfolioForService, mergeAllPortfolio, COMPANY_NAME, SERVICE_OPTIONS } from "./data/siteData.js";
import {
  Toast, StatItem, LoginPage, Hero, TeamWorkspace, ClientWorkspace, ServicesSection, ServiceDetailPage, PortfolioSection,
  ProcessSection, WhyUsSection, IndustriesSection, PricingSection, EstimatorSection, TestimonialsSection,
  MultiStepForm, FeedbackForm, CtaBand, Footer
} from "./components/index.jsx";
import { logoutFirebase } from "./services/firebase.js";

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function BuildbigPlatform(){
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [hasProjects, setHasProjects] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [portForm, setPortForm] = useState({title:"",service:"Video Editing",description:"",client:"",outcome:""});
  const [portMedia, setPortMedia] = useState(null);
  const [toast, setToast] = useState({msg:"",show:false});
  const toastTimer = useRef(null);
  const showToast=(msg)=>{
    clearTimeout(toastTimer.current);
    setToast({msg,show:true});
    toastTimer.current = setTimeout(()=>setToast(t=>({...t,show:false})),3200);
  };
  const loadPortfolio = useCallback(async ()=>{
    try {
      const { portfolio } = await api.getPortfolio();
      setPortfolioItems(portfolio);
    } catch (e) {
      void e;
    }
  }, []);
  const loadTestimonials = useCallback(async ()=>{
    try {
      const { testimonials: list } = await api.getTestimonials();
      setTestimonials(list);
    } catch (e) {
      void e;
    }
  }, []);
  useEffect(()=>{
    const token = getToken();
    if(!token){ queueMicrotask(() => setAuthLoading(false)); return; }
    api.me()
      .then(({ user: me })=>setUser(me))
      .catch(()=>setToken(null))
      .finally(()=>setAuthLoading(false));
  }, []);
  const checkProjects = useCallback(async () => {
    if(!user) return;
    if(user.role === "team") { setHasProjects(true); return; }
    try {
      const { projects } = await api.getProjects();
      setHasProjects(projects.length > 0);
    } catch (e) {
      void e;
    }
  }, [user]);
  useEffect(()=>{
    if(user){
      queueMicrotask(() => {
        loadPortfolio();
        loadTestimonials();
        checkProjects();
      });
    }
  }, [user, loadPortfolio, loadTestimonials, checkProjects]);
  const handleLogin = (userData) => {
    setUser(userData);
    setPage("home");
  };
  const handleLogout = () => {
    logoutFirebase();
    setToken(null);
    setUser(null);
    setPage("home");
  };
  const [prefillPlan, setPrefillPlan] = useState(null);
  const handleStartProject = (plan = null) => {
    if(user?.role==="team") return showToast("Clients start projects from this button.");
    if(!user) {
      showToast("Please sign in or create an account to start your project.");
      setPage("login");
      return;
    }
    setPrefillPlan(plan?.name ? plan : null);
    setShowForm(true);
  };
  const handleDeletePortfolio = async (id) => {
    try {
      await api.deletePortfolio(id);
      await loadPortfolio();
      showToast("Portfolio item deleted.");
    } catch (e) {
      showToast(e.message || "Could not delete portfolio.");
    }
  };
  const handleAddPortfolio = async () => {
    if(!portForm.title||!portForm.description) return showToast("Title and description are required.");
    try {
      const formData = new FormData();
      formData.append("title", portForm.title);
      formData.append("service", portForm.service);
      formData.append("description", portForm.description);
      formData.append("client", portForm.client);
      formData.append("outcome", portForm.outcome);
      if(portMedia) formData.append("media", portMedia);
      await api.addPortfolio(formData);
      setPortForm({title:"",service:"Video Editing",description:"",client:"",outcome:""});
      setPortMedia(null);
      setShowPortForm(false);
      await loadPortfolio();
      showToast("Portfolio item added!");
    } catch (e) {
      showToast(e.message || "Could not add portfolio.");
    }
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
      Testimonials: "testimonials",
    };
    setPage(map[navItem] || "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openPortfolioForm = (serviceTitle = "Video Editing") => {
    setPortForm((f) => ({ ...f, service: serviceTitle }));
    setShowPortForm(true);
  };
  if(authLoading){
    return(<><style>{styles}</style><div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Loading...</div></>);
  }
  if(!user){
    return(
      <>
        <style>{styles}</style>
        <LoginPage onLogin={handleLogin}/>
        <Toast msg={toast.msg} show={toast.show}/>
      </>
    );
  }
  const isWorkspace = page==="workspace";
  return(
    <>
      <style>{styles}</style>
      <Toast msg={toast.msg} show={toast.show}/>
      {/* NAV */}
      {!isWorkspace&&(
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}>
              <img src={LOGO_URL} alt={COMPANY_NAME} className="nav-logo-img"/>
              <span className="nav-logo-text">{COMPANY_NAME.toUpperCase()}</span>
            </div>
            <div className="nav-links">
              {NAV_LINKS.map(l=>(
                <button key={l} className={`nav-link ${NAV_PAGE_MAP[l]?.includes(page)?"active":""}`} onClick={()=>handleNavClick(l)}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {hasProjects && (
                <button className="btn-ghost" style={{padding:"10px 18px",fontSize:".88rem"}} onClick={()=>setPage("workspace")}>
                  {user.role==="team"?"Team Workspace":"My Workspace"}
                </button>
              )}
              <button className="nav-cta" onClick={handleStartProject}>Start Project</button>
              <div style={{display:"flex",alignItems:"center",gap:8,border:"1px solid var(--line2)",borderRadius:"999px",padding:"5px 6px 5px 10px",color:"var(--muted2)",fontSize:".82rem"}}>
                <span style={{width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,var(--red),var(--red-dark))",color:"#fff",fontWeight:700,fontSize:".72rem"}}>
                  {(user.name||user.email||"U").split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()}
                </span>
                <span style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name||user.email}</span>
                <button onClick={handleLogout} style={{padding:"6px 9px",borderRadius:"999px",color:"var(--muted)",fontSize:".82rem",transition:"all .2s"}} title="Logout">⏻</button>
              </div>
            </div>
          </div>
        </nav>
      )}
      {/* WORKSPACE */}
      {isWorkspace&&(
        <>
          <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,borderBottom:"1px solid var(--line)",background:"rgba(0,0,0,.9)",backdropFilter:"blur(20px)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <img src={LOGO_URL} alt={COMPANY_NAME} style={{width:36,height:36}}/>
              <span className="bn" style={{fontSize:"1.2rem",letterSpacing:".2em"}}>{COMPANY_NAME.toUpperCase()}</span>
            </div>
            <button className="btn-ghost" style={{padding:"8px 16px",fontSize:".86rem"}} onClick={()=>setPage("home")}>← Back to Site</button>
          </div>
          <div style={{paddingTop:62}}>
            {user.role==="team"
              ? <TeamWorkspace user={user} onToast={showToast} onPortfolioChange={loadPortfolio}/>
              : <ClientWorkspace user={user} onToast={showToast} onShowFeedback={()=>setShowFeedback(true)} onStartProject={()=>setShowForm(true)}/>
            }
          </div>
        </>
      )}
      {/* SERVICES LIST PAGE */}
      {page==="services-list"&&(
        <div className="page">
          <section className="section">
            <div className="section-inner">
              <button className="service-page-back" onClick={()=>setPage("home")}>← Back to Home</button>
              <div className="section-label">OUR SERVICES</div>
              <h1 className="section-title">Everything Your Business Needs to Grow</h1>
              <p className="section-sub">Click on any service to explore our portfolio and start your project.</p>
              <div className="services-grid" style={{marginTop:48}}>
                {SERVICES.map(s=>(
                  <button className="svc-card" key={s.title} onClick={()=>handleServiceClick(s)}>
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
      {/* SERVICE DETAIL PAGE */}
      {page==="service"&&activeService&&(
        <ServiceDetailPage
          service={activeService}
          onBack={()=>setPage("services-list")}
          onStartProject={handleStartProject}
          portfolioItems={mergePortfolioForService(activeService.title, portfolioItems)}
          isTeam={user.role==="team"}
          onAddPortfolio={()=>openPortfolioForm(activeService.title)}
          onDeletePortfolio={handleDeletePortfolio}
        />
      )}
      {page==="process"&&(
        <div className="page">
          <ProcessSection/>
          <WhyUsSection/>
        </div>
      )}
      {page==="pricing"&&(
        <div className="page">
          <PricingSection onStartProject={handleStartProject}/>
        </div>
      )}
      {page==="portfolio"&&(
        <div className="page">
          <PortfolioSection
            standalone
            onStartProject={handleStartProject}
            portfolioItems={mergeAllPortfolio(portfolioItems)}
            isTeam={user.role==="team"}
            onAddPortfolio={()=>openPortfolioForm("Video Editing")}
            onDeletePortfolio={handleDeletePortfolio}
          />
        </div>
      )}
      {page==="testimonials"&&(
        <div className="page">
          <TestimonialsSection testimonials={testimonials} onAddFeedback={()=>setShowFeedback(true)} user={user}/>
          <CtaBand onStartProject={handleStartProject}/>
        </div>
      )}
      {/* HOME PAGE */}
      {page==="home"&&(
        <div className="page">
          <Hero onStartProject={handleStartProject}/>
          {/* MARQUEE */}
          <div className="marquee">
            <div className="marquee-track">
              {["VIDEO EDITING","VFX","WEB DEVELOPMENT","APP DEVELOPMENT","GAME DEVELOPMENT","MARKETING","CONTENT CREATION","BRANDING"].flatMap(w=>[`${w} ·`,`${w} ·`]).map((w,i)=>(
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
          {/* COUNTERS */}
          <section className="section stats-section" style={{padding:"0"}}>
            <div className="stats-grid">
              <StatItem value={50} suffix="+" label="Projects Delivered"/>
              <StatItem value={98} suffix="%" label="Client Retention Rate"/>
              <StatItem value={1} suffix="K" label="Social Followers Generated" onClick={()=>{ setPage("testimonials"); window.scrollTo({top:0,behavior:"smooth"}); }}/>
              <StatItem value={4} suffix=".9★" label="Average Client Rating"/>
            </div>
          </section>
          <ServicesSection onServiceClick={handleServiceClick}/>
          <PortfolioSection onStartProject={handleStartProject} standalone={true} />
          <WhyUsSection/>
          <IndustriesSection/>
          <EstimatorSection/>
          <CtaBand onStartProject={handleStartProject}/>
          <Footer/>
        </div>
      )}
      {/* MODALS */}
      {showForm&&<MultiStepForm onClose={()=>setShowForm(false)} onToast={showToast} user={user} onProjectCreated={()=>{ checkProjects(); setPage("workspace"); }} prefillPlan={prefillPlan}/>}
      {showPortForm&&(
        <div className="msf-backdrop">
          <div className="msf-modal" style={{maxWidth:640}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 className="bn" style={{fontSize:"1.8rem"}}>Add Portfolio</h2>
              <button onClick={()=>setShowPortForm(false)} style={{border:"1px solid var(--line2)",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div className="msf-grid">
              <div className="field"><label>Title *</label><input value={portForm.title} onChange={e=>setPortForm(f=>({...f,title:e.target.value}))} placeholder="Project title"/></div>
              <div className="field"><label>Service</label>
                <select value={portForm.service} onChange={e=>setPortForm(f=>({...f,service:e.target.value}))}>
                  {SERVICE_OPTIONS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Description *</label><textarea value={portForm.description} onChange={e=>setPortForm(f=>({...f,description:e.target.value}))} placeholder="What was the project about?"/></div>
            <div className="msf-grid">
              <div className="field"><label>Client</label><input value={portForm.client} onChange={e=>setPortForm(f=>({...f,client:e.target.value}))} placeholder="Client name"/></div>
              <div className="field"><label>Key Outcome</label><input value={portForm.outcome} onChange={e=>setPortForm(f=>({...f,outcome:e.target.value}))} placeholder="e.g. 2x Revenue"/></div>
            </div>
            <div className="field"><label>Upload Media</label>
              <div className="drop-zone" style={{position:"relative"}}>
                <div style={{fontSize:"2rem",marginBottom:8}}>📤</div>
                <div style={{fontSize:".88rem",color:"var(--muted)"}}>Click to upload video or image</div>
                <input type="file" accept="video/*,image/*" style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}} onChange={e=>setPortMedia(e.target.files?.[0]||null)}/>
              </div>
            </div>
            <button className="btn-primary" style={{width:"100%"}} onClick={handleAddPortfolio}>Add to Portfolio ✓</button>
          </div>
        </div>
      )}
      {showFeedback&&(
        <FeedbackForm
          user={user}
          onSubmit={(fb)=>{
            setTestimonials(prev=>[fb,...prev]);
            showToast("Thank you for your feedback! It will appear on our testimonials page.");
          }}
          onClose={()=>setShowFeedback(false)}
        />
      )}
    </>
  );
}
