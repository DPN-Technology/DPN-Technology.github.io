import fs from "node:fs";

const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("styles.css","utf8");
const app=fs.readFileSync("app.js","utf8");
const sw=fs.readFileSync("service-worker.js","utf8");

const fail=(message)=>{console.error("MOBILE SMOKE FAIL:",message);process.exitCode=1;};
const pass=(message)=>console.log("MOBILE SMOKE PASS:",message);

try{new Function(app);pass("app.js parses");}catch(error){fail(`app.js syntax: ${error.message}`);}

if(!html.includes("viewport-fit=cover")) fail("viewport-fit=cover missing");
else pass("safe viewport meta present");

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const counts=new Map();
for(const id of ids)counts.set(id,(counts.get(id)||0)+1);
const duplicates=[...counts.entries()].filter(([,n])=>n>1);
if(duplicates.length)fail(`duplicate IDs: ${duplicates.map(([id])=>id).join(", ")}`);
else pass("no duplicate IDs");

const secondary=new Set([...html.matchAll(/<section[^>]*id="([^"]+)"[^>]*data-secondary-detail="true"[^>]*>/g)].map(m=>m[1]));
const dock=html.match(/<nav class="mobile-command-dock"[\s\S]*?<\/nav>/)?.[0]||"";
const targets=[...dock.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
if(targets.length<4)fail("mobile command dock missing primary links");
for(const target of targets){
  if(!ids.includes(target))fail(`mobile dock target #${target} does not exist`);
  if(secondary.has(target))fail(`mobile dock target #${target} is hidden by default`);
}
if(targets.length>=4)pass(`mobile dock targets visible sections: ${targets.join(", ")}`);

const cssChecks=[
  ["safe-area bottom","safe-area-inset-bottom"],
  ["dynamic viewport height","100dvh"],
  ["dynamic viewport width","100dvw"],
  ["mobile breakpoint","@media(max-width:760px)"],
  ["coarse pointer guard","@media(hover:none),(pointer:coarse)"],
  ["compact mobile header",'grid-template-areas:"brand status"']
];
for(const [label,needle] of cssChecks){
  if(!css.includes(needle))fail(`${label} missing`); else pass(label);
}

if(!app.includes('compact?"balanced":"full"'))fail("mobile visual mode does not default to balanced");
else pass("mobile defaults to balanced effects");
if(!app.includes("window.visualViewport?.addEventListener"))fail("visualViewport resize listener missing");
else pass("dynamic mobile viewport listener present");
if(!app.includes('node?.dataset.secondaryDetail==="true"'))fail("hidden detail navigation auto-reveal missing");
else pass("hidden detail navigation auto-reveals");

// The cache namespace must follow the deployed site's advertised version.
// Avoid baking yesterday's release number into every future mobile smoke run.
const siteVersion=html.match(/DPN COMMAND CENTER \/\/ (v\d+\.\d+)/)?.[1];
if(!siteVersion)fail("advertised site version not found");
else if(!sw.includes(`dpn-command-center-${siteVersion}`))fail(`service worker cache must match ${siteVersion}`);
else pass(`service worker cache aligned to ${siteVersion}`);

const frontierJs=fs.readFileSync("frontiers.js","utf8");
const frontierCss=fs.readFileSync("frontiers.css","utf8");
try{new Function(frontierJs);pass("frontiers.js parses");}catch(error){fail(`frontiers.js syntax: ${error.message}`);}
if(!html.includes('id="frontiers"'))fail("2026 frontier section missing");
else pass("2026 frontier section present");
const cards=[...html.matchAll(/class="frontier-card(?: featured)?"/g)].length;
if(cards<10)fail(`frontier registry incomplete: ${cards} cards`);
else pass(`frontier initiative cards: ${cards}`);
if(!frontierCss.includes("@media(max-width:650px)"))fail("frontier narrow screen layout missing");
else pass("frontier mobile layout present");
for(const file of ["./frontiers.css","./frontiers.js"]){
 if(!sw.includes(file))fail(`PWA offline cache missing ${file}`);
 else pass(`PWA includes ${file}`);
}

if(process.exitCode)process.exit(process.exitCode);
