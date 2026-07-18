import logoUrl from '../assets/assetweberlogo.png';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const COMPANY_NAME = 'Assets Weber';
export const NAV_LINKS = ["Home","Services","Portfolio","Learning","Process","Testimonials","Contact"];
export const NAV_PAGE_MAP = {
  Services: ["services-list", "service"],
  Process: ["process"],
  Pricing: ["pricing"],
  Portfolio: ["portfolio"],
  Learning: ["learning"],
  Projects: ["projects"],
  Testimonials: ["testimonials"],
};
export const LOGO_URL = logoUrl;
export const TEAM_ID = "1234567890";
export const SERVICE_MAP = {
  "Web Development": "Web Development",
  "Mobile Apps": "Mobile Apps",
  "AI Solutions": "AI Solutions",
  "Video Editing": "Video Editing",
  "Content Creation": "Content Creation",
  "Branding": "Branding",
  "Automation": "Automation",
};
export const SERVICES = [
  {icon:"🌐",title:"Web Development",desc:"Production-ready websites, landing pages, portals, and scalable business web applications built for performance and conversion.",details:["Fast, premium front-end delivery with scalable structure.","Built for business operations, leads, and long-term maintainability.","Landing pages, websites, portals, and custom internal tools."]},
  {icon:"📱",title:"Mobile Apps",desc:"iOS and Android apps with a clean UX, practical architecture, and reliable delivery for startups and businesses.",details:["MVPs, client apps, internal apps, and utility tools.","Cross-platform delivery with a focus on usability and speed.","Built to support future backend and product expansion."]},
  {icon:"🤖",title:"AI Solutions",desc:"Automations, assistants, and workflow tools that reduce manual work and help teams move faster.",details:["Workflow automation and AI-assisted operations.","Lead handling, data processing, and internal productivity tools.","Simple, scalable AI utilities without unnecessary complexity."]},
  {icon:"🎬",title:"Video Editing",desc:"Cinematic edits, reels, ads, trailers, and brand films shaped for premium visual identity and retention.",details:["Dynamic cuts, color work, and sound-aware pacing.","Short-form and long-form content for brands and creators.","Consistent quality across campaign and social formats."]},
  {icon:"✍️",title:"Content Creation",desc:"Scripts, captions, social content, and campaign assets designed to keep your brand active and consistent.",details:["Content planning, scripts, and social-first deliverables.","Campaign assets that support growth and visibility.","Structured output for ongoing agency retainer work."]},
  {icon:"🎨",title:"Branding",desc:"Identity systems, visual direction, and brand assets that make businesses look established and memorable.",details:["Logo direction, brand kits, and visual guidelines.","Clean, premium identity systems built for consistency.","Designed to support web, content, and marketing use cases."]},
  {icon:"⚙️",title:"Automation",desc:"Simple automation systems for lead flow, operations, and recurring business tasks.",details:["Notifications, follow-ups, and internal workflow support.","Less manual work, fewer repetitive mistakes.","Built to help small teams operate like larger ones."]},
];
export const VIDEO_FILE_META = {
  "BATCH 2.0.mp4": { title:"BATCH 2.0 – Cinematic Cut", client:"Assets Weber", desc:"Full cinematic production with premium transitions and color grading.", outcome:"Viral reach across multiple platforms" },
  "BRONZE TO HEROIC Journey Begins! _ Free Fire Ranked Push Series Day 1.mp4": { title:"Bronze to Heroic Journey", client:"Free Fire Gaming", desc:"Gaming highlight reel with dynamic editing, speed ramps, and motion graphics.", outcome:"10K+ views in first 48 hours" },
  "CORECT DR SABRINA.mp4": { title:"Dr. Sabrina – Official", client:"Assets Weber", desc:"Professionally edited music video with color correction and effects.", outcome:"Premium brand content delivered" },
  "GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4": { title:"Game Change – Music Video", client:"Assets Weber Productions", desc:"Full music video production with cinematic visuals and professional editing.", outcome:"Official release content" },
  "MINE OFFICIAl TRAILER .mp4": { title:"Mine – Official Trailer", client:"Assets Weber", desc:"High-impact trailer cut with dramatic pacing, SFX, and visual storytelling.", outcome:"Theatrical trailer quality achieved" },
  "Tech and policy Sybercecurity project .mp4": { title:"Tech & Cybersecurity Project", client:"Corporate Client", desc:"Professional explainer video with motion graphics and clean editing.", outcome:"Corporate presentation delivered" },
  "I Moved at the WRONG Time in Roblox Squid Game… 😰.mp4": { title:"Roblox Squid Game Edit", client:"Gaming Client", desc:"Fast-paced gaming edit with retention-focused cuts.", outcome:"High engagement content" },
};
export const VIDEO_ASSETS = Object.entries(VIDEO_FILE_META).map(([file, meta], i) => ({
  id: `video-asset-${i}`,
  title: meta.title || `Short Video ${i + 1}`,
  client: meta.client || "Assets Weber",
  service: "Video Editing",
  file,
  fileUrl: withAppBase(`/assets/${encodeURIComponent(file)}`),
  desc: meta.desc || "Professional video editing by Assets Weber.",
  outcome: meta.outcome || "Premium content delivered",
}));
function matchVideoAsset(item) {
  if (!item) return null;
  const fileName = item.file || item.mediaName || item.mediaUrl?.split("/").pop();
  if (fileName) {
    const normalized = decodeURIComponent(fileName);
    const byFile = VIDEO_ASSETS.find((a) => a.file === normalized);
    if (byFile) return byFile;
  }
  if (item.title) {
    const title = item.title.toLowerCase();
    return VIDEO_ASSETS.find((a) => a.title.toLowerCase() === title) || null;
  }
  return null;
}

export function enrichVideoPortfolioItem(item) {
  if (item.fileUrl) return item;
  const match = matchVideoAsset(item);
  return match ? { ...item, fileUrl: match.fileUrl, file: match.file, mediaName: match.file } : item;
}

function withAppBase(path) {
  if (!path || path.startsWith("http")) return path;
  const base = import.meta.env.BASE_URL || "/";
  if (path.startsWith(base)) return path;
  return `${base}${path.replace(/^\//, "")}`;
}

export function resolvePortfolioMediaSrc(item) {
  if (!item) return '';
  if (item.fileUrl) return item.fileUrl;
  const match = matchVideoAsset(item);
  if (match) return match.fileUrl;
  if (item.file) return withAppBase(`/assets/${encodeURIComponent(item.file)}`);
  const url = item.mediaUrl || '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const apiBase = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? 'http://localhost:4000' : (typeof window !== 'undefined' ? window.location.origin : ''));
  if (url.startsWith('/uploads')) return apiBase + url;
  return withAppBase(url);
}

export function mergePortfolioForService(serviceTitle, apiPortfolio = []) {
  const apiForService = apiPortfolio.filter((p) => p.service === serviceTitle);
  if (serviceTitle !== "Video Editing") return apiForService;
  const enriched = apiForService.map(enrichVideoPortfolioItem);
  const seen = new Set(enriched.map((p) => (p.title || "").toLowerCase()));
  const assets = VIDEO_ASSETS.filter((a) => !seen.has(a.title.toLowerCase()));
  return [...enriched, ...assets];
}
export function mergeAllPortfolio(apiPortfolio = []) {
  const videoItems = mergePortfolioForService("Video Editing", apiPortfolio);
  const otherItems = apiPortfolio.filter((p) => p.service !== "Video Editing");
  return [...videoItems, ...otherItems];
}
export function isDeletablePortfolioItem(item) {
  return Boolean(item?.id?.startsWith("portfolio_"));
}
export const PROCESS_STEPS = [
  {num:"01",title:"Discovery Call",desc:"We understand your goals, audience, and vision in a free 30-minute strategy session."},
  {num:"02",title:"Strategy & Brief",desc:"Our team builds a detailed creative brief and project roadmap tailored to your objectives."},
  {num:"03",title:"Production",desc:"Design, development, or filming begins with regular check-ins and milestone updates."},
  {num:"04",title:"Review & Revise",desc:"You review the work and request revisions until every detail is exactly right."},
  {num:"05",title:"Delivery & Launch",desc:"Final deliverables are handed over with a launch plan and post-delivery support."},
];
export const WHY_US = [
  {icon:"⚡",title:"Fast Turnaround",desc:"Most projects delivered within committed timelines. Rush options available for urgent campaigns."},
  {icon:"🎯",title:"Results-Focused",desc:"Every deliverable is built around measurable outcomes — views, conversions, and growth."},
  {icon:"🌍",title:"Global Standards",desc:"International-level production quality at honest Indian market pricing."},
  {icon:"🤝",title:"Dedicated Manager",desc:"Every client gets a dedicated project handler as their single point of contact."},
  {icon:"🔄",title:"Revision Policy",desc:"We include structured revisions in every plan — your satisfaction is non-negotiable."},
  {icon:"📊",title:"Transparent Reporting",desc:"Regular project updates, analytics reports, and status tracking in your client dashboard."},
];
export const INDUSTRIES = [
  {emoji:"🏋️",title:"Gyms & Fitness",desc:"Membership content, trainers, classes"},
  {emoji:"☕",title:"Cafes & Restaurants",desc:"Menu reels, ambiance, promotions"},
  {emoji:"🏫",title:"Coaching & Education",desc:"Student portals, courses, content"},
  {emoji:"🏠",title:"Real Estate",desc:"Property tours, cinematic videos"},
  {emoji:"👗",title:"Fashion & Retail",desc:"Product shoots, ecommerce, lookbooks"},
  {emoji:"💊",title:"Healthcare & Wellness",desc:"Explainer videos, trust-building"},
  {emoji:"🖥️",title:"Tech & Startups",desc:"App demos, pitch decks, SaaS videos"},
  {emoji:"🏦",title:"Finance & Legal",desc:"Explainer content, trust-building"},
];
export const TESTIMONIALS_STATIC = [];
export const PRICING_CATEGORIES = ["Video Editing","VFX","Websites","Apps","Games","Marketing"];
export const PRICING_DATA = {
  "Video Editing":[
    {name:"Basic Edit",plan:"Per Video",price:"₹1,499",period:"/video",badge:null,desc:"Clean and professional editing for standard content.",features:["Clean editing","Captions","Music sync","Simple transitions"],cta:"Order Now",best:"For standard social media content"},
    {name:"Professional Edit",plan:"Per Video",price:"₹4,999",period:"/video",badge:"Most Popular",desc:"High-retention editing with motion graphics.",features:["Motion graphics","Speed ramps","Sound design","Retention-focused editing","Advanced subtitles"],cta:"Book Edit",best:"For YouTube, reels & branded content"},
    {name:"Cinematic Ad",plan:"Per Video",price:"₹14,999",period:"+",badge:null,desc:"Commercial-grade editing for brand campaigns.",features:["Commercial-style editing","Premium transitions","Storytelling structure","Color grading","Brand-focused editing"],cta:"Start Project",best:"For ads, launches & premium campaigns",starting:true},
  ],
  "VFX":[
    {name:"Basic VFX",plan:"Per Shot",price:"₹2,999",period:"/shot",badge:null,desc:"Essential visual effects for clean compositing and polish.",features:["Object removal","Screen replacements","Simple compositing","Color matching","Basic rotoscoping"],cta:"Order VFX",best:"For social content & quick fixes"},
    {name:"Advanced VFX",plan:"Per Shot",price:"₹9,999",period:"/shot",badge:"Most Popular",desc:"Cinematic VFX with motion tracking and layered compositing.",features:["Motion tracking","CGI integration","Particle effects","Advanced compositing","Environment extensions"],cta:"Book VFX",best:"For ads, music videos & trailers"},
    {name:"Cinematic VFX",plan:"Per Project",price:"₹49,999",period:"+",badge:null,desc:"Full VFX pipeline for film-grade productions.",features:["3D asset integration","Full scene compositing","Matchmoving","Premium CGI","Color pipeline & delivery"],cta:"Start Project",best:"For films, OTT & premium campaigns",starting:true},
  ],
  "Websites":[
    {name:"Business Website",plan:"One-Time",price:"₹24,999",period:"+",badge:null,desc:"Professional business website to build your online presence.",features:["Responsive design","Up to 5 pages","SEO basics","Contact form","Modern UI"],cta:"Build Now",best:"For local businesses & service providers",starting:true},
    {name:"Premium Website",plan:"One-Time",price:"₹59,999",period:"+",badge:"Most Popular",desc:"Custom UI/UX with advanced animations and CMS.",features:["Custom UI/UX design","Advanced animations","CMS dashboard","Premium responsive design","SEO optimization"],cta:"Get Premium",best:"For professional businesses & agencies",starting:true},
    {name:"Ecommerce Store",plan:"One-Time",price:"₹99,999",period:"+",badge:null,desc:"Full-featured online store ready to sell.",features:["Payment gateway integration","Admin dashboard","Product management system","Inventory management","Authentication system"],cta:"Build Store",best:"For product brands & D2C companies",starting:true},
  ],
  "Apps":[
    {name:"MVP App",plan:"One-Time",price:"₹1,99,999",period:"+",badge:null,desc:"Minimum viable mobile app for Android & iOS.",features:["Android/iOS support","Authentication","API integration","Clean modern UI"],cta:"Build MVP",best:"For startups & new app ideas",starting:true},
    {name:"Full App",plan:"One-Time",price:"₹3,49,999",period:"+",badge:"Most Popular",desc:"Full-featured production app with backend.",features:["Real-time systems","Push notifications","Admin panel","Scalable architecture","Multi-platform"],cta:"Build App",best:"For established businesses",starting:true},
    {name:"Enterprise App",plan:"One-Time",price:"₹5,99,999",period:"+",badge:null,desc:"Complex enterprise-grade application.",features:["Advanced backend","Multiple user roles","Analytics dashboard","Custom APIs","Security features"],cta:"Contact Us",best:"For large businesses & platforms",starting:true},
  ],
  "Games":[
    {name:"Promotional Game",plan:"One-Time",price:"₹79,999",period:"+",badge:null,desc:"Branded mobile game for marketing campaigns.",features:["Simple gameplay","Brand integration","Mobile optimized"],cta:"Start Game",best:"For brand campaigns & events",starting:true},
    {name:"2D Game",plan:"One-Time",price:"₹2,99,999",period:"+",badge:"Most Popular",desc:"Full 2D game with backend and multiplayer.",features:["2D assets","Multiplayer systems","Leaderboard","In-app purchases","Cross-platform"],cta:"Build Game",best:"For indie studios & brands",starting:true},
    {name:"3D Game",plan:"One-Time",price:"₹4,99,999",period:"+",badge:null,desc:"Multiplayer 3D game with full backend.",features:["3D assets","Multiplayer systems","Backend integration","Cross-platform support"],cta:"Build 3D Game",best:"For gaming studios & brands",starting:true},
  ],
  "Marketing":[
    {name:"Starter Growth",plan:"Content",price:"₹12,999",period:"/month",badge:null,desc:"Perfect for local businesses building their social presence.",features:["8 reels/month","Basic editing & captions","Content planning calendar","Social media post designs","3-day delivery"],cta:"Get Started",best:"For small businesses & local shops"},
    {name:"Business Growth",plan:"Content",price:"₹24,999",period:"/month",badge:"Most Popular",desc:"All-inclusive social media management for serious brands.",features:["16 reels/month","Advanced editing & motion graphics","Speed ramps & sound design","Thumbnail & post design","Monthly strategy call","Instagram management"],cta:"Start Growing",best:"For gyms, cafes, coaching, property dealers"},
    {name:"Domination",plan:"Content",price:"₹49,999",period:"/month",badge:null,desc:"Full-scale social domination for fast-growing brands.",features:["30 reels/month","Cinematic content production","Full social media management","Ad creatives included","Advanced motion graphics","Analytics reporting","Dedicated manager"],cta:"Dominate Now",best:"For growing brands & companies"},
  ],
};
export const ESTIMATOR_CONFIG = {
  service: ["Video Editing","VFX","Website","Web App","Mobile App","Game Development","Marketing"],
  complexity: ["Simple / MVP","Standard","Advanced","Enterprise / Custom"],
  features: ["Authentication","Dashboard","Payments","API Integration","Admin Panel","CMS","Real-time Features","Analytics"],
  timeline: ["Rush (1-2 weeks)","Standard (4-6 weeks)","Extended (2-3 months)","Flexible"],
};
export const ESTIMATE_MAP = {
  "Video Editing":{min:1500,max:20000,time:"3-10 days"},
  "VFX":{min:3000,max:80000,time:"5-21 days"},
  "Website":{min:25000,max:120000,time:"4-8 weeks"},
  "Web App":{min:150000,max:600000,time:"8-20 weeks"},
  "Mobile App":{min:200000,max:650000,time:"10-18 weeks"},
  "Game Development":{min:80000,max:600000,time:"12-24 weeks"},
  "Marketing":{min:13000,max:50000,time:"Monthly"},
};
export const COMPLEXITY_MULT = {"Simple / MVP":1,"Standard":1.5,"Advanced":2.2,"Enterprise / Custom":3.5};
export const TIMELINE_MULT = {"Rush (1-2 weeks)":1.5,"Standard (4-6 weeks)":1,"Extended (2-3 months)":0.85,"Flexible":0.9};
export const TEAM_CATEGORIES = ["All","Web Development","Mobile Apps","AI Solutions","Video Editing","Content Creation","Branding","Automation"];
export const SERVICE_OPTIONS = ["Web Development","Mobile Apps","AI Solutions","Video Editing","Content Creation","Branding","Automation"];
// Demo data for workspace
export const DEMO_PROJECTS = [
  {id:"1",title:"Brand Growth Content Plan",service:"Marketing",clientId:"c1",clientName:"Arjun Mehta",status:"In production",messages:[{id:"1",role:"system",text:"Project created and handler assigned."},{id:"2",role:"team",name:"Rahul (Handler)",text:"Hey! Got your brief. Let's start with the first batch of 8 reels."},{id:"3",role:"client",name:"Arjun Mehta",text:"Sounds great, excited to get started!"}],timeline:[{label:"Brief Submitted",done:true},{label:"Handler Assigned",done:true},{label:"Content Plan Shared",done:true},{label:"First Batch Production",active:true},{label:"Review & Delivery",done:false}]},
  {id:"2",title:"Business Website Redesign",service:"Web Development",clientId:"c2",clientName:"Priya Sharma",status:"First draft shared",messages:[{id:"1",role:"system",text:"Project created."},{id:"2",role:"team",name:"Priya (Developer)",text:"Your website draft is live on the staging link I sent. Please review and list your feedback."}],timeline:[{label:"Brief Submitted",done:true},{label:"Design Mockup",done:true},{label:"Development",done:true},{label:"Draft Review",active:true},{label:"Launch",done:false}]},
  {id:"3",title:"Game Development – Promo",service:"Game Development",clientId:"c3",clientName:"Ravi Kapoor",status:"New brief submitted",messages:[{id:"1",role:"system",text:"Project brief received. A project handler will review it shortly."}],timeline:[{label:"Brief Submitted",done:true},{label:"Handler Assigned",done:false},{label:"Design Phase",done:false},{label:"Development",done:false},{label:"Launch",done:false}]},
];
