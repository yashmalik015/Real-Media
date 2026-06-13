import { useState, useEffect, useRef } from "react";

// ─── UTILITIES ────────────────────────────────────────────────────────────────
export function formatIndian(n){if(n>=10000000)return`₹${(n/10000000).toFixed(1)}Cr`;if(n>=100000)return`₹${(n/100000).toFixed(n%100000===0?0:1)}L`;if(n>=1000)return`₹${Math.round(n/1000)}K`;return`₹${n}`}
export function useCountUp(target, duration=1800){
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const obs = new IntersectionObserver(([e])=>{
      if(!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = ()=>{
        const p = Math.min((Date.now()-start)/duration,1);
        setCount(Math.round(p*p*target));
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },{threshold:.4});
    obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[target,duration]);
  return [count,ref];
}
