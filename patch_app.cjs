const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { ClientPortal } from "./components/ClientPortal.jsx";',
  'import { ClientPortal } from "./components/ClientPortal.jsx";\nimport GlobalErrorBoundary from "./components/ErrorBoundary.jsx";\nimport NotFound from "./components/NotFound.jsx";'
);

// 2. Wrap return of App with GlobalErrorBoundary
code = code.replace(
  '  return (\n    <>\n      <style>',
  '  return (\n    <GlobalErrorBoundary>\n    <>\n      <style>'
);
const lastClosingTag = '    </>\n  );\n}';
code = code.replace(
  lastClosingTag,
  '    </>\n    </GlobalErrorBoundary>\n  );\n}'
);

// 3. Update syncRoute
const syncRouteOriginal = `      if (!match) return;
      const slug = match[1];
      const foundInPublic = PUBLIC_SERVICES.find((item) => serviceSlug(item.title) === slug);
      const foundInSkills = skills.find((item) => serviceSlug(item.title) === slug);
      const matched = foundInPublic || foundInSkills;

      if (matched) {
        setSelectedService(matched.title);
      } else {
        const formattedTitle = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        setSelectedService(formattedTitle);
      }
      setPage("service");`;

const syncRouteNew = `      if (!match) {
        if (window.location.pathname !== '/' && window.location.pathname !== '') {
          setPage("404");
        }
        return;
      }
      const slug = match[1];
      const foundInPublic = PUBLIC_SERVICES.find((item) => serviceSlug(item.title) === slug);
      const foundInSkills = skills.find((item) => serviceSlug(item.title) === slug);
      const matched = foundInPublic || foundInSkills;

      if (matched) {
        setSelectedService(matched.title);
        setPage("service");
      } else {
        setPage("404");
      }`;
code = code.replace(syncRouteOriginal, syncRouteNew);

// 4. Add 404 page case
const page404Original = `        ) : page === "pricing" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <FuturisticPricing onSelectPlan={(plan, svc) => { setSelectedPlan({ plan, service: svc || '' }); setShowInquiry(true); }} pricingData={pricing} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : (`;
const page404New = `        ) : page === "pricing" ? (
          <div className="page" style={{ paddingTop: 100 }}>
            <FuturisticPricing onSelectPlan={(plan, svc) => { setSelectedPlan({ plan, service: svc || '' }); setShowInquiry(true); }} pricingData={pricing} />
            <FuturisticFooter onNavigate={requestPage} />
          </div>
        ) : page === "404" ? (
          <NotFound />
        ) : (`;
code = code.replace(page404Original, page404New);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx patched successfully');
