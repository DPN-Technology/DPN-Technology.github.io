(() => {
  "use strict";

  const ORG = "DPN-Technology";
  const API = "https://api.github.com";
  const EXCLUDED = new Set([".github", "DPN-Technology.github.io"]);

  const state = {
    repos: [],
    releases: [],
    lastFetch: null,
    languageCounts: new Map(),
    evidence: new Map(),
    evidenceScanned: false,
    evidenceCacheHits: 0,
    runtimeEvidence: [],
    runtimeManifests: new Map(),
    runtimeRejected: new Map(),
    captureRuns: new Map(),
    captureRunsScanned: false,
    captureRunErrors: 0,
    activeFamily: "all",
    evidenceIndex: 0,
    evidencePinnedSlug: "",
    deepLinkHandled: new Set(),
    visualMode: "full",
    presentationActive: false,
    presentationStep: 0,
    presentationPriorVisualMode: "full"
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    apiState: $("github-api-state"),
    clock: $("command-clock"),
    repos: $("metric-repos"),
    push: $("metric-push"),
    pushRepo: $("metric-push-repo"),
    issues: $("metric-issues"),
    releases: $("metric-releases"),
    stars: $("metric-stars"),
    forks: $("metric-forks"),
    languages: $("metric-languages"),
    languageList: $("metric-language-list"),
    opsSync: $("ops-last-sync"),
    activity: $("activity-feed"),
    languageBars: $("language-bars"),
    projectGrid: $("project-grid"),
    search: $("project-search"),
    refresh: $("refresh-telemetry"),
    releaseFeed: $("release-feed"),
    terminal: $("terminal-body"),
    fabricDetail: $("fabric-detail"),
    palette: $("command-palette"),
    paletteSearch: $("command-search"),
    paletteResults: $("command-results"),
    launcher: $("command-launcher"),
    stormToggle: $("storm-toggle"),
    meshState: $("mesh-state"),
    meshNodes: $("mesh-nodes"),
    meshReleaseSources: $("mesh-release-sources"),
    meshRecent: $("mesh-recent"),
    meshEvents: $("mesh-events"),
    meshEventState: $("mesh-event-state"),
    meshConsole: $("mesh-event-console"),
    topology: $("public-topology"),
    meshDrawer: $("mesh-drawer"),
    meshDrawerTitle: $("mesh-drawer-title"),
    meshDrawerBody: $("mesh-drawer-body"),
    meshDrawerClose: $("mesh-drawer-close"),
    stateFilter: $("project-state-filter"),
    projectCount: $("project-result-count"),
    resetProjectFilters: $("reset-project-filters"),
    journal: $("journal-list"),
    evidenceRepos: $("evidence-repos"),
    evidenceReadmes: $("evidence-readmes"),
    evidenceSecurity: $("evidence-security"),
    evidenceLicense: $("evidence-license"),
    evidenceArchitecture: $("evidence-architecture"),
    evidenceRelease: $("evidence-release"),
    evidenceState: $("evidence-state"),
    evidenceBody: $("evidence-table-body")
  };

  const architecture = {
    core: {
      code: "ARCH://CORE",
      title: "DPN Technology Core",
      description: "The shared operating idea beneath DPN systems: explicit control, observable state, bounded automation, evidence-backed decisions and a known recovery path.",
      control: "Shared foundations instead of hidden coupling",
      evidence: "Architecture, health, audit and release evidence",
      recovery: "Systems should fail visibly and return deliberately",
      links: [
        ["Engineering Standard", "https://github.com/DPN-Technology/.github/blob/main/ENGINEERING_STANDARD.md"],
        ["Operating Model", "https://github.com/DPN-Technology/.github#dpn-technology-organization-engineering-hub"]
      ]
    },
    identity: {
      code: "ARCH://IDENTITY",
      title: "Identity & Trust",
      description: "Establish who or what is acting, then bound that authority through authentication, authorization, device trust, roles, clearance and policy.",
      control: "Actor + resource + permission + condition",
      evidence: "Sessions, privileged actions, policy decisions",
      recovery: "Revoke, rotate, re-authenticate, re-enroll",
      links: [
        ["Threat Model Template", "https://github.com/DPN-Technology/.github/blob/main/templates/THREAT_MODEL_TEMPLATE.md"],
        ["Security Policy", "https://github.com/DPN-Technology/.github/blob/main/SECURITY.md"]
      ]
    },
    observability: {
      code: "ARCH://OBSERVE",
      title: "Observability & Evidence",
      description: "Important state should come from measurements rather than decorative labels: health, logs, events, topology, audit, synthetic checks and verification evidence.",
      control: "Signals must map to a real source",
      evidence: "Metrics, logs, events, tests, provenance",
      recovery: "Evidence survives long enough to explain failure",
      links: [
        ["Reliability Standard", "https://github.com/DPN-Technology/.github/blob/main/RELIABILITY_STANDARD.md"],
        ["SLO Template", "https://github.com/DPN-Technology/.github/blob/main/templates/SLO_TEMPLATE.md"]
      ]
    },
    automation: {
      code: "ARCH://AUTOMATION",
      title: "Automation & Orchestration",
      description: "DPN automation should move approved work forward without turning invisible background behavior into uncontrolled authority.",
      control: "Policy, approval, scope and failure boundaries",
      evidence: "Inputs, decisions, actions and outcomes",
      recovery: "Pause, cancel, retry, compensate or roll back",
      links: [
        ["Quality Gates", "https://github.com/DPN-Technology/.github/blob/main/QUALITY_GATES.md"],
        ["Governance", "https://github.com/DPN-Technology/.github/blob/main/GOVERNANCE.md"]
      ]
    },
    integration: {
      code: "ARCH://INTEGRATION",
      title: "Integration Fabric",
      description: "Systems should connect through explicit contracts—APIs, events, schemas, SDKs and webhooks—rather than hidden assumptions between implementations.",
      control: "Authentication, authorization, version and limits",
      evidence: "Delivery health, errors, retries and correlation",
      recovery: "Degrade, queue, migrate, deprecate and retire",
      links: [
        ["Integration Standard", "https://github.com/DPN-Technology/.github/blob/main/INTEGRATION_CONTRACT_STANDARD.md"],
        ["Contract Template", "https://github.com/DPN-Technology/.github/blob/main/templates/INTEGRATION_CONTRACT_TEMPLATE.md"]
      ]
    },
    intelligence: {
      code: "ARCH://INTELLIGENCE",
      title: "AI, Agents & Tooling",
      description: "AI-assisted systems should make tool authority, model boundaries, memory scope, evidence and human control visible instead of treating generation as trusted execution.",
      control: "Tool permissions, scope and review points",
      evidence: "Inputs, outputs, tool calls, artifacts and validation",
      recovery: "Checkpoint, reject, revert and re-run",
      links: [
        ["Engineering Standard", "https://github.com/DPN-Technology/.github/blob/main/ENGINEERING_STANDARD.md"],
        ["Data Handling", "https://github.com/DPN-Technology/.github/blob/main/DATA_HANDLING_STANDARD.md"]
      ]
    },
    recovery: {
      code: "ARCH://RECOVERY",
      title: "Recovery & Continuity",
      description: "Failure is treated as a state transition. Degraded operation, isolation, rollback, restore and post-recovery verification should be designed before an incident.",
      control: "Recovery authority and trigger conditions",
      evidence: "Backups, checkpoints, incident timeline, validation",
      recovery: "Restore to a known, explainable, trustworthy state",
      links: [
        ["Incident Response", "https://github.com/DPN-Technology/.github/blob/main/INCIDENT_RESPONSE.md"],
        ["Runbook Template", "https://github.com/DPN-Technology/.github/blob/main/templates/RUNBOOK_TEMPLATE.md"]
      ]
    }
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const FAMILY_LABELS = {"all":"ALL PUBLIC PRODUCTS","control":"CONTROL + INFRASTRUCTURE","ai":"AI + DEVELOPMENT","retail":"RETAIL + AQUARIUM SYSTEMS","workforce":"WORKFORCE + BUSINESS","platform":"PLATFORM + IDENTITY","interactive":"INTERACTIVE + SIMULATION"};

  const ARCH_PRODUCTS = {"core":["DPN-One","DPN-Operational-Control","DPN-Executive-Control-System"],"identity":["DPN-One","DPN-Executive-Control-System","DPN-Human-Resources-Software"],"observability":["DPN-Watch-Tower","DPN-Network-Mapper","DPN-Operational-Control"],"automation":["DPN-AI","DPN-Operational-Control","DPN-Workforce-Time-Management-System"],"integration":["DPN-One","DPN-Operational-Control","DPN-Aqua-Labs-Point-of-Sale-System"],"intelligence":["DPN-AI","DPN-Death-the-Developer"],"recovery":["DPN-OS","DPN-Watch-Tower","DPN-Executive-Control-System"]};

  const BASE_TITLE = "DPN Technology // GitHub Command Center";
  const BASE_DESCRIPTION = "DPN Technology Command Center — inspect public products, engineering evidence, releases, architecture, build lineage and trust controls.";

  const EVIDENCE_PROVENANCE = {
    "aqua-desktop-dashboard.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/modern_ui.py"], note:"Current PySide6 Store Command Center structure." },
    "aqua-desktop-register.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/modern_ui_v23.py"], note:"Barcode-first POS register structure." },
    "aqua-desktop-store-network.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/modern_ui_v2108.py"], note:"Terminal Command Center / Store Hub registry layout." },
    "aqua-inventory-command.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/modern_ui.py"], note:"Inventory catalog, stock, pricing and reorder workflow." },
    "aqua-purchasing-command.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/supply_chain_lifecycle.py"], note:"Purchasing and supply-chain workflow source." },
    "aqua-maintenance-center.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/modern_ui_v2110.py","app/maintenance_scheduler.py"], note:"Maintenance work-order UI and recurring scheduler." },
    "aqua-end-of-day-control.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/end_of_day.py"], note:"End-of-day closeout and reconciliation workflow." },
    "aqua-aquanode-command.svg": { repo:"DPN-Aqua-Labs-Point-of-Sale-System", platform:"desktop", files:["app/sensor_telemetry.py"], note:"AquaNode sensor telemetry model." },
    "operational-control-command-nexus.svg": { repo:"DPN-Operational-Control", platform:"web", files:["app/static/index.html","app/static/app.js"], note:"Public source backing the Command Nexus interface." },
    "dpn-one-overview.svg": { repo:"DPN-One", platform:"web", files:["src/components/DpnOneApp.tsx","src/lib/data.ts"], note:"DPN One overview UI; data.ts explicitly declares demo/placeholder data." },
    "death-the-developer-studio.svg": { repo:"DPN-Death-the-Developer", platform:"desktop", files:["dpn_dtd/app.py","dpn_dtd/ui/theme.py"], note:"Tk desktop studio layout and current theme source." },
    "dpn-os-control-center.svg": { repo:"DPN-OS", platform:"desktop", files:["config/includes.chroot/usr/share/dpn-control-center/main.qml"], note:"DPN OS Control Center QML source." },
    "dpn-ecs-command-center.svg": { repo:"DPN-Executive-Control-System", platform:"web", files:["frontend/index.html","frontend/app.js","frontend/dpn_v18_41_DOOR_WEBHOOK_EVENT_FEEDS.js"], note:"v18.41-derived Executive Control System command-center surface." },
    "dpn-workforce-executive.svg": { repo:"DPN-Workforce-Time-Management-System", platform:"web", files:["public/index.html","public/app.js"], note:"Current workforce public frontend structure." },
    "dpn-hr-executive-dashboard.svg": { repo:"DPN-Human-Resources-Software", platform:"web", files:["public/index.html","public/app.js"], note:"Current HRIS public frontend structure." },
    "dpn-watchtower-command-center.svg": { repo:"DPN-Watch-Tower", platform:"web", files:["public/index.html","public/app.js"], note:"Current WatchTower public frontend structure." },
    "dpn-ai-command-center.svg": { repo:"DPN-AI", platform:"desktop", files:["app/static/index.html","app/static/app.js"], note:"Current DPN AI desktop command-center shell." },
    "network-mapper-topology-workbench.svg": { repo:"DPN-Network-Mapper", platform:"web", files:["public/index.html","public/app.js"], note:"Current topology/evidence workbench source." },
    "service-desk-admin-queue.svg": { repo:"DPN-Service-Desk", platform:"web", files:["components/admin-desk.tsx"], note:"Current technician/admin ticket queue component." },
    "dtd-browser-smoke-evidence.svg": { repo:"DPN-Death-the-Developer", platform:"mobile", files:["docs/evidence/browser-smoke-mobile.png"], note:"Actual mobile browser smoke verification artifact stored in the public repository." }
  };

  const EVIDENCE_PLATFORM_OVERRIDES = {
    "service-desk.webp":"web",
    "network-mapper.webp":"web",
    "memespace-pool.webp":"game",
    "memespace-pinball-evidence.svg":"game",
    "aqua-mobile.webp":"mobile",
    "dtd-brand.webp":"artwork"
  };

  const PRESENTATION_STEPS = [
    ["top","Command Center Core"],
    ["product-worlds","Product Worlds"],
    ["company","Company + Leadership"],
    ["founder-command","Founder Command"],
    ["product-families","Product Constellations"],
    ["fusion-mesh","Public Fusion Mesh"],
    ["architecture","Architecture Atlas"],
    ["projects","Public Project Dossiers"],
    ["inside-builds","Visual Evidence Museum"],
    ["capture-factory","Runtime Capture Factory"],
    ["runtime-evidence-intake","Runtime Evidence Intake"],
    ["verification-board","Product Verification Board"],
    ["build-lineage","Build Lineage"],
    ["trust","Trust Center"],
    ["roadmap","Public Direction"]
  ];

  function evidenceAssetName(src) {
    return String(src || "").split("/").pop()?.split("?")[0] || "";
  }

  function provenanceForItem(item) {
    return EVIDENCE_PROVENANCE[evidenceAssetName(item?.src)] || null;
  }

  function platformForItem(item) {
    const asset=evidenceAssetName(item?.src);
    if (EVIDENCE_PLATFORM_OVERRIDES[asset]) return EVIDENCE_PLATFORM_OVERRIDES[asset];
    const provenance=provenanceForItem(item);
    if (provenance?.platform) return provenance.platform;
    const value=String(item?.title || "").toLowerCase();
    if (item?.type==="artwork") return "artwork";
    if (/mobile/.test(value)) return "mobile";
    if (/memespace|game|simulator|pinball/.test(value)) return "game";
    if (/desktop|register|aqua labs|dpn os|death the developer|dpn ai/.test(value)) return "desktop";
    return "web";
  }

  function publicSourceFileUrl(repoName,path) {
    const repo=state.repos.find(item=>item.name===repoName);
    const branch=encodeURIComponent(repo?.default_branch || "main");
    const encoded=String(path || "").split("/").map(encodeURIComponent).join("/");
    return `https://github.com/${ORG}/${encodeURIComponent(repoName)}/blob/${branch}/${encoded}`;
  }

  function setBrowserContext(title,description=BASE_DESCRIPTION) {
    document.title=title ? `${title} // DPN Technology` : BASE_TITLE;
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute("content",description || BASE_DESCRIPTION);
  }

  function resetBrowserContext() {
    setBrowserContext("",BASE_DESCRIPTION);
  }

  function slugify(value){
    return String(value||"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,96);
  }

  function familyForRepo(name){
    const value=String(name||"").toLowerCase();
    if(/aqua/.test(value))return"retail";
    if(/dpn-ai|death-the-developer/.test(value))return"ai";
    if(/operational-control|executive-control|watch-tower|network-mapper|dpn-os/.test(value))return"control";
    if(/workforce|human-resources|service-desk/.test(value))return"workforce";
    if(/dpn-one/.test(value))return"platform";
    if(/memespace|tool-die|simulator|fivem/.test(value))return"interactive";
    return"platform";
  }

  function evidenceRepoForTitle(title){
    const value=String(title||"").toLowerCase();
    const pairs=[
      [/aqua labs/,"DPN-Aqua-Labs-Point-of-Sale-System"],
      [/service desk/,"DPN-Service-Desk"],
      [/network mapper/,"DPN-Network-Mapper"],
      [/operational control/,"DPN-Operational-Control"],
      [/dpn one/,"DPN-One"],
      [/dpn os/,"DPN-OS"],
      [/executive control|\becs\b/,"DPN-Executive-Control-System"],
      [/workforce/,"DPN-Workforce-Time-Management-System"],
      [/dpn hr|hris/,"DPN-Human-Resources-Software"],
      [/watchtower/,"DPN-Watch-Tower"],
      [/dpn ai/,"DPN-AI"],
      [/death the developer/,"DPN-Death-the-Developer"],
      [/memespace/,"MemeSpace"]
    ];
    return pairs.find(([pattern])=>pattern.test(value))?.[1]||"";
  }

  function evidenceTypeOf(figure){
    if(figure.classList.contains("evidence-runtime"))return"runtime";
    if(figure.classList.contains("evidence-source"))return"source";
    if(figure.classList.contains("evidence-artwork"))return"artwork";
    return"other";
  }

  function evidenceCatalog(){
    return [...document.querySelectorAll(".evidence-wall figure")].map((figure,index)=>{
      const title=figure.querySelector("figcaption b")?.textContent?.trim()||`Evidence ${index+1}`;
      const description=figure.querySelector("figcaption span")?.textContent?.trim()||"";
      const image=figure.querySelector("img");
      const type=evidenceTypeOf(figure);
      const slug=figure.dataset.evidenceSlug||slugify(title);
      figure.dataset.evidenceSlug=slug;
      figure.dataset.evidenceIndex=String(index);
      const src=image?.getAttribute("src")||"";
      const provisional={index,figure,title,description,type,slug,src,alt:image?.getAttribute("alt")||title,stamp:figure.querySelector(".gallery-frame > span")?.textContent?.trim()||type.toUpperCase(),repo:evidenceRepoForTitle(title)};
      provisional.provenance=provenanceForItem(provisional);
      provisional.platform=platformForItem(provisional);
      if(provisional.provenance?.repo)provisional.repo=provisional.provenance.repo;
      figure.dataset.platform=provisional.platform;
      return provisional;
    });
  }

  function evidenceForRepo(repoName){return evidenceCatalog().filter(item=>item.repo===repoName);}
  function visualProofStateForRepo(repoName){
    const visuals=evidenceForRepo(repoName);
    const runtime=visuals.filter(item=>item.type==="runtime").length;
    const source=visuals.filter(item=>item.type==="source").length;
    if(runtime>0)return "runtime";
    if(source>0)return "source-only";
    return "none";
  }

  function setDeepLink(key,value){
    const url=new URL(window.location.href);
    if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
    ["evidence","project","release","arch","mesh"].forEach(other=>{if(other!==key)url.searchParams.delete(other);});
    history.pushState({[key]:value},"",url);
  }

  function clearDeepLink(key){
    const url=new URL(window.location.href);url.searchParams.delete(key);history.replaceState({},"",url);
  }

  function productThemeFor(item){
    const value=String(item?.title||"").toLowerCase();
    if(value.includes("aqua"))return"aqua";
    if(value.includes("death the developer")||value.includes("dpn one"))return"violet";
    if(value.includes("network mapper"))return"network";
    if(value.includes("dpn ai"))return"ai";
    return"red";
  }

  function repoArtifactLinks(repo){
    const ev=state.evidence.get(repo.name);
    if(!ev||ev.error)return[];
    return[["README",ev.paths?.readme],["SECURITY",ev.paths?.security],["LICENSE / NOTICE",ev.paths?.license],["ARCHITECTURE",ev.paths?.architecture]]
      .filter(([,path])=>Boolean(path)).map(([label,path])=>[label,artifactUrl(repo,path),path]);
  }

  const fmtDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(d);
  };

  const fmtTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit"
    }).format(d);
  };

  const relativeAge = (value) => {
    if (!value) return "unknown";
    const ms = Date.now() - new Date(value).getTime();
    const minutes = Math.max(0, Math.floor(ms / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 60) return `${days}d ago`;
    return fmtDate(value);
  };

  const addTerminal = (level, text) => {
    if (!els.terminal) return;
    const p = document.createElement("p");
    const now = new Date().toLocaleTimeString([], { hour12: false });
    p.innerHTML = `<i>${now}</i> <b>[${escapeHtml(level)}]</b> ${escapeHtml(text)}`;
    els.terminal.appendChild(p);
    while (els.terminal.children.length > 16) els.terminal.removeChild(els.terminal.firstElementChild);
    els.terminal.scrollTop = els.terminal.scrollHeight;
  };

  async function api(path) {
    const response = await fetch(API + path, {
      headers: { "Accept": "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      throw new Error(`GitHub API ${response.status}${remaining === "0" ? " (rate limit reached)" : ""}`);
    }
    return response.json();
  }


  function rawRepoFileUrl(repo,path,ref=repo.default_branch || "main") {
    const encodedPath=String(path||"").split("/").map(encodeURIComponent).join("/");
    return `https://raw.githubusercontent.com/${ORG}/${encodeURIComponent(repo.name)}/${encodeURIComponent(ref)}/${encodedPath}`;
  }

  function runtimeEvidenceForRepo(repoName) {
    return state.runtimeEvidence.filter(item=>item.repo===repoName);
  }

  function validateRuntimeManifest(repo,manifest) {
    if(!manifest || typeof manifest!=="object" || Array.isArray(manifest)) throw new Error("manifest must be an object");
    if(Number(manifest.schemaVersion)!==1) throw new Error("unsupported schemaVersion");
    if(String(manifest.repository||"")!==repo.name) throw new Error("manifest repository mismatch");
    if(String(manifest.evidenceType||"")!=="actual-rendered-ui") throw new Error("evidenceType must be actual-rendered-ui");
    if(!Array.isArray(manifest.artifacts) || manifest.artifacts.length<1 || manifest.artifacts.length>12) throw new Error("artifact count outside accepted range");

    const generatedAt=String(manifest.generatedAt||"").slice(0,80);
    const sourceCommit=String(manifest.sourceCommit||"").slice(0,80);
    if(sourceCommit && sourceCommit!=="local" && !/^[0-9a-f]{7,40}$/i.test(sourceCommit)) throw new Error("invalid sourceCommit");
    const product=String(manifest.product||repo.name).slice(0,120);
    const dataBoundary=String(manifest.dataBoundary||"No data-boundary statement supplied.").slice(0,1200);
    const runnerRequirement=String(manifest.runnerRequirement||"").slice(0,300);

    const artifacts=manifest.artifacts.map((artifact,index)=>{
      if(!artifact || typeof artifact!=="object" || Array.isArray(artifact)) throw new Error(`artifact ${index+1} must be an object`);
      const file=String(artifact.file||"").trim();
      if(!/^[A-Za-z0-9._-]+\.(?:png|jpe?g|webp)$/i.test(file)) throw new Error(`artifact ${index+1} has invalid image file`);
      if(file.includes("..") || file.includes("/") || file.includes("\\")) throw new Error(`artifact ${index+1} escapes runtime evidence directory`);
      return {
        file,
        label:String(artifact.label||file).slice(0,160),
        route:String(artifact.route||"").slice(0,300),
        viewport:String(artifact.viewport||"").slice(0,80)
      };
    });

    return {schemaVersion:1,product,repository:repo.name,generatedAt,sourceCommit,evidenceType:"actual-rendered-ui",dataBoundary,runnerRequirement,artifacts};
  }

  async function fetchRuntimeManifest(repo,evidence) {
    const path=evidence?.paths?.runtimeManifest;
    if(!path) return null;
    const rawUrl=rawRepoFileUrl(repo,path);
    const response=await fetch(rawUrl,{cache:"no-store",headers:{"Accept":"application/json,text/plain;q=0.9,*/*;q=0.1"}});
    if(!response.ok) throw new Error(`manifest HTTP ${response.status}`);
    const text=await response.text();
    if(text.length>64*1024) throw new Error("manifest too large");
    let parsed;
    try{parsed=JSON.parse(text);}catch{throw new Error("manifest is not valid JSON");}
    const manifest=validateRuntimeManifest(repo,parsed);
    const manifestUrl=artifactUrl(repo,path);
    const artifacts=manifest.artifacts.map(artifact=>({
      repo:repo.name,
      product:manifest.product,
      file:artifact.file,
      label:artifact.label,
      route:artifact.route,
      viewport:artifact.viewport,
      generatedAt:manifest.generatedAt,
      sourceCommit:manifest.sourceCommit,
      dataBoundary:manifest.dataBoundary,
      runnerRequirement:manifest.runnerRequirement,
      imageUrl:rawRepoFileUrl(repo,`docs/evidence/runtime/${artifact.file}`),
      sourceUrl:artifactUrl(repo,`docs/evidence/runtime/${artifact.file}`),
      manifestUrl,
      rawManifestUrl:rawUrl
    }));
    return {manifest,artifacts};
  }

  async function scanRuntimeEvidence() {
    state.runtimeEvidence=[];
    state.runtimeManifests=new Map();
    state.runtimeRejected=new Map();

    const candidates=state.repos.filter(repo=>{
      const evidence=state.evidence.get(repo.name);
      return evidence && !evidence.error && evidence.runtimeManifest;
    }).slice(0,20);

    const results=await Promise.all(candidates.map(async repo=>{
      try{
        const result=await fetchRuntimeManifest(repo,state.evidence.get(repo.name));
        return {repo,result,error:null};
      }catch(error){
        return {repo,result:null,error:String(error?.message||error||"manifest unavailable")};
      }
    }));

    for(const item of results){
      if(item.result){
        state.runtimeManifests.set(item.repo.name,item.result.manifest);
        state.runtimeEvidence.push(...item.result.artifacts);
      }else{
        state.runtimeRejected.set(item.repo.name,item.error||"manifest rejected");
      }
    }

    state.runtimeEvidence=state.runtimeEvidence.slice(0,60);
    addTerminal("EVIDENCE",`Runtime intake: ${state.runtimeManifests.size} valid manifest(s), ${state.runtimeEvidence.length} artifact(s), ${state.runtimeRejected.size} rejected/unreadable`);
  }

  function renderRuntimeEvidence() {
    const feed=$("runtime-evidence-feed"),status=$("runtime-evidence-state");
    if(!feed)return;

    const products=new Set(state.runtimeEvidence.map(item=>item.repo));
    if($("runtime-manifest-valid"))$("runtime-manifest-valid").textContent=String(state.runtimeManifests.size);
    if($("runtime-artifact-count"))$("runtime-artifact-count").textContent=String(state.runtimeEvidence.length);
    if($("runtime-product-count"))$("runtime-product-count").textContent=String(products.size);
    if($("runtime-rejected-count"))$("runtime-rejected-count").textContent=String(state.runtimeRejected.size);

    if(status){
      status.textContent=state.runtimeEvidence.length
        ? `INGESTED // ${state.runtimeEvidence.length} RUNTIME ARTIFACT${state.runtimeEvidence.length===1?"":"S"} // ${products.size} PRODUCT${products.size===1?"":"S"}`
        : state.runtimeRejected.size
          ? `NO ACCEPTED ARTIFACTS // ${state.runtimeRejected.size} MANIFEST ERROR${state.runtimeRejected.size===1?"":"S"}`
          : "AWAITING PUBLIC MANIFESTS";
      status.className="runtime-evidence-state "+(state.runtimeEvidence.length?"online":state.runtimeRejected.size?"partial":"");
    }

    if(!state.runtimeEvidence.length){
      const rejection=[...state.runtimeRejected.entries()].map(([name,error])=>`<div><b>${escapeHtml(name)}</b><span>${escapeHtml(error)}</span></div>`).join("");
      feed.innerHTML=`<article class="runtime-evidence-empty"><strong>No validated runtime captures are available yet.</strong><span>Installed factories remain automation evidence until they commit a valid manifest and image artifacts.</span>${rejection?`<section class="runtime-rejection-list">${rejection}</section>`:""}</article>`;
      return;
    }

    feed.innerHTML=state.runtimeEvidence.map(item=>`
      <article class="runtime-evidence-card">
        <div class="runtime-evidence-image">
          <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.product+" — "+item.label)}" loading="lazy" decoding="async">
          <span>ACTUAL RENDERED UI</span>
        </div>
        <header>
          <div><small>${escapeHtml(item.repo)}</small><h3>${escapeHtml(item.label)}</h3></div>
          <b>${escapeHtml(item.viewport||"VIEWPORT UNSPECIFIED")}</b>
        </header>
        <p>${escapeHtml(item.dataBoundary)}</p>
        <dl>
          <div><dt>PRODUCT</dt><dd>${escapeHtml(item.product)}</dd></div>
          <div><dt>GENERATED</dt><dd>${escapeHtml(item.generatedAt?fmtDate(item.generatedAt):"UNSPECIFIED")}</dd></div>
          <div><dt>SOURCE COMMIT</dt><dd>${escapeHtml(item.sourceCommit||"UNSPECIFIED")}</dd></div>
          <div><dt>ROUTE / VIEW</dt><dd>${escapeHtml(item.route||item.label)}</dd></div>
        </dl>
        ${item.runnerRequirement?`<div class="runtime-runner-requirement"><span>RUNNER REQUIREMENT</span><b>${escapeHtml(item.runnerRequirement)}</b></div>`:""}
        <footer>
          <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">OPEN IMAGE SOURCE ↗</a>
          <a href="${escapeHtml(item.manifestUrl)}" target="_blank" rel="noreferrer">OPEN MANIFEST ↗</a>
          <button type="button" data-runtime-dossier="${escapeHtml(item.repo)}">PROJECT DOSSIER</button>
        </footer>
      </article>
    `).join("");

    feed.querySelectorAll("img").forEach(img=>img.addEventListener("error",()=>{
      img.closest(".runtime-evidence-image")?.classList.add("image-failed");
      img.alt="Runtime evidence image could not be loaded from the public repository.";
    }));
    feed.querySelectorAll("[data-runtime-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.runtimeDossier)));
  }

  async function fetchReleases(repos) {
    const results = await Promise.all(
      repos.slice(0, 16).map(async (repo) => {
        try {
          const releases = await api(`/repos/${ORG}/${encodeURIComponent(repo.name)}/releases?per_page=20`);
          return releases
            .filter(release => !release.draft)
            .map(release => ({
              repo: repo.name,
              tag: release.tag_name,
              name: release.name || release.tag_name,
              url: release.html_url,
              published_at: release.published_at || release.created_at,
              prerelease: Boolean(release.prerelease)
            }));
        } catch {
          return [];
        }
      })
    );
    return results.flat().sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }

  function releaseRepoSet() {
    return new Set(state.releases.map(release => release.repo));
  }

  function isRecent(repo) {
    const age = Date.now() - new Date(repo.pushed_at || 0).getTime();
    return age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
  }

  const EVIDENCE_CACHE_KEY = "dpn-command-center-evidence-v4.2";
  const EVIDENCE_CACHE_TTL = 10 * 60 * 1000;

  function readEvidenceCache(repo) {
    try {
      const cache = JSON.parse(localStorage.getItem(EVIDENCE_CACHE_KEY) || "{}");
      const entry = cache[repo.name];
      const signature = `${repo.default_branch || "main"}:${repo.pushed_at || ""}`;
      if (!entry || entry.signature !== signature || Date.now() - entry.savedAt > EVIDENCE_CACHE_TTL) return null;
      return entry.evidence || null;
    } catch {
      return null;
    }
  }

  function writeEvidenceCache(repo, evidence) {
    try {
      const cache = JSON.parse(localStorage.getItem(EVIDENCE_CACHE_KEY) || "{}");
      cache[repo.name] = {
        signature: `${repo.default_branch || "main"}:${repo.pushed_at || ""}`,
        savedAt: Date.now(),
        evidence
      };
      localStorage.setItem(EVIDENCE_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Storage can be unavailable in privacy modes; live scanning still works.
    }
  }

  function detectEvidence(paths) {
    const entries=paths.map(path=>({raw:path,normalized:path.toLowerCase()}));
    const locate=(predicate)=>entries.find(entry=>predicate(entry.normalized))?.raw || null;
    const readmePath=locate(path => /^readme(?:\.|$)/.test(path));
    const securityPath=locate(path => /(^|\/)security\.md$/.test(path));
    const licensePath=locate(path =>
      /(^|\/)(license|copying)(\.[^/]+)?$/.test(path) ||
      /(^|\/)(third_party_licenses|third-party-licenses|third_party_notices|third-party-notices)(\.[^/]+)?$/.test(path)
    );
    const architecturePath=locate(path =>
      /(^|\/)architecture\.md$/.test(path) ||
      /(^|\/)docs\/architecture(\.md)?$/.test(path) ||
      /(^|\/)architecture\//.test(path)
    );
    const captureWorkflowPath=locate(path => path === ".github/workflows/ui-evidence-capture.yml" || path === ".github/workflows/ui-evidence-capture.yaml");
    const captureToolPath=locate(path => /(^|\/)tools\/capture_ui_evidence\.(mjs|js|py)$/.test(path));
    const runtimeManifestPath=locate(path => /(^|\/)docs\/evidence\/runtime\/manifest\.json$/.test(path));

    return {
      readme: Boolean(readmePath),
      security: Boolean(securityPath),
      license: Boolean(licensePath),
      architecture: Boolean(architecturePath),
      captureFactory: Boolean(captureWorkflowPath && captureToolPath),
      runtimeManifest: Boolean(runtimeManifestPath),
      paths: {
        readme: readmePath,
        security: securityPath,
        license: licensePath,
        architecture: architecturePath,
        captureWorkflow: captureWorkflowPath,
        captureTool: captureToolPath,
        runtimeManifest: runtimeManifestPath
      }
    };
  }

  async function scanEvidence() {
    if (state.evidenceScanned) {
      renderEvidenceMatrix();
      return;
    }
    state.evidenceScanned=true;
    if (els.evidenceState) {
      els.evidenceState.textContent="SCANNING PUBLIC TREES";
      els.evidenceState.className="";
    }

    const repos=state.repos.slice(0,20);
    state.evidenceCacheHits=0;
    const scans=await Promise.all(repos.map(async repo => {
      const cached=readEvidenceCache(repo);
      if(cached){
        state.evidenceCacheHits++;
        return [repo.name,{...cached,error:false,cached:true}];
      }
      try {
        const tree=await api(`/repos/${ORG}/${encodeURIComponent(repo.name)}/git/trees/${encodeURIComponent(repo.default_branch || "main")}?recursive=1`);
        const paths=(tree.tree || []).filter(item=>item.type==="blob").map(item=>item.path);
        const evidence={...detectEvidence(paths),error:false,treeTruncated:Boolean(tree.truncated),cached:false};
        writeEvidenceCache(repo,evidence);
        return [repo.name,evidence];
      } catch (error) {
        return [repo.name,{readme:false,security:false,license:false,architecture:false,captureFactory:false,runtimeManifest:false,paths:{},error:true,treeTruncated:false,cached:false}];
      }
    }));

    state.evidence=new Map(scans);
    renderEvidenceMatrix();
  }

  function computeLanguageCounts() {
    const map = new Map();
    for (const repo of state.repos) {
      const language = repo.language || "Other / unspecified";
      map.set(language, (map.get(language) || 0) + 1);
    }
    state.languageCounts = map;
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  async function loadTelemetry() {
    if (els.apiState) els.apiState.textContent = "PUBLIC TELEMETRY SYNCHRONIZING";
    addTerminal("SYNC", "Requesting public organization repository metadata");
    if (els.refresh) els.refresh.disabled = true;

    try {
      const all = await api(`/orgs/${ORG}/repos?type=public&sort=pushed&per_page=100`);
      state.repos = all.filter(repo => !EXCLUDED.has(repo.name) && !repo.archived);
      state.lastFetch = new Date();
      state.evidenceScanned = false;
      state.evidence.clear();
      state.runtimeEvidence=[];
      state.runtimeManifests.clear();
      state.runtimeRejected.clear();
      state.captureRuns.clear();
      state.captureRunsScanned=false;
      state.captureRunErrors=0;

      const publicIssues = state.repos.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0);
      const totalStars = state.repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = state.repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
      const latest = [...state.repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
      const languages = computeLanguageCounts();

      state.releases = await fetchReleases(state.repos);
      await scanEvidence();
      await scanRuntimeEvidence();

      if (els.repos) els.repos.textContent = String(state.repos.length);
      if (els.issues) els.issues.textContent = String(publicIssues);
      if (els.releases) els.releases.textContent = String(state.releases.length);
      if (els.stars) els.stars.textContent = String(totalStars);
      if (els.forks) els.forks.textContent = String(totalForks);
      if (els.languages) els.languages.textContent = String(languages.length);
      if (els.languageList) els.languageList.textContent = languages.slice(0, 3).map(([name]) => name).join(" • ") || "no public language metadata";
      if (els.push) els.push.textContent = latest ? fmtDate(latest.pushed_at) : "—";
      if (els.pushRepo) els.pushRepo.textContent = latest ? latest.name : "No public repositories";
      if (els.apiState) els.apiState.textContent = "PUBLIC TELEMETRY ONLINE";
      const heroSignal = $("hero-signal-state");
      const signalGitHub = $("signal-github");
      const signalAge = $("signal-age");
      if (heroSignal) heroSignal.textContent = "PUBLIC TELEMETRY ONLINE";
      if (signalGitHub) signalGitHub.textContent = "GITHUB // ONLINE";
      if (signalAge) signalAge.textContent = `LAST SYNC // ${fmtTime(state.lastFetch)}`;
      if (els.opsSync) els.opsSync.textContent = `synced ${fmtTime(state.lastFetch)} • public API`;

      addTerminal(
        "GITHUB",
        `Loaded ${state.repos.length} public project repos; ${publicIssues} open issues; ${state.releases.length} release records`
      );

      renderProjects();
      renderActivity();
      renderLanguages();
      renderReleases();
      renderFusionMesh();
      renderBuildLineage();
      renderBuildJournal();
      renderCommandIndex();
      updateEvidenceCoverage();
      renderRuntimeEvidence();
      renderCaptureFactory();
      renderVerificationBoard();
      updateVisualOverdrive();
      updateProductWorldStats();
      updateWorldEvidenceStrips();
      renderAllWorldRuntimeTheaters();
      renderAllLiveProductShells();
      updateCommandBridge();
      applyDeepLinksAfterTelemetry();
    } catch (error) {
      if (els.apiState) els.apiState.textContent = "PUBLIC TELEMETRY UNAVAILABLE";
      const heroSignal = $("hero-signal-state");
      const signalGitHub = $("signal-github");
      const signalAge = $("signal-age");
      if (heroSignal) heroSignal.textContent = "PUBLIC TELEMETRY UNAVAILABLE";
      if (signalGitHub) signalGitHub.textContent = "GITHUB // UNAVAILABLE";
      if (signalAge) signalAge.textContent = "LAST SYNC // FAILED";
      for (const el of [els.repos, els.push, els.issues, els.releases, els.stars, els.forks, els.languages]) {
        if (el) el.textContent = "N/A";
      }
      if (els.pushRepo) els.pushRepo.textContent = "Static content remains available";
      if (els.opsSync) els.opsSync.textContent = "public API unavailable";
      addTerminal("WARN", error.message || "Public GitHub telemetry unavailable");
      renderFallback();
      renderActivityFallback();
      renderReleaseFallback();
      renderFusionFallback();
      renderJournalFallback();
      renderEvidenceFallback();
      state.runtimeEvidence=[];
      state.runtimeManifests.clear();
      state.runtimeRejected.clear();
      state.captureRuns.clear();
      state.captureRunsScanned=false;
      state.captureRunErrors=0;
      renderRuntimeEvidence();
      renderCaptureFactory();
      renderVerificationBoard();
    } finally {
      if (els.refresh) els.refresh.disabled = false;
    }
  }

  function languageLabel(repo) {
    return repo.language || "Multi-language / unspecified";
  }

  function renderProjects(){
    if(!els.projectGrid)return;
    const query=(els.search?.value||"").trim().toLowerCase();
    const filter=els.stateFilter?.value||"all";
    const releaseRepos=releaseRepoSet();
    const repos=state.repos.filter(repo=>{
      const hay=[repo.name,repo.description,repo.language,...(repo.topics||[])].filter(Boolean).join(" ").toLowerCase();
      const queryMatch=!query||hay.includes(query);
      const stateMatch=filter==="all"||(filter==="recent"&&isRecent(repo))||(filter==="releases"&&releaseRepos.has(repo.name))||(filter==="issues"&&(repo.open_issues_count||0)>0)||(filter==="stars"&&(repo.stargazers_count||0)>0);
      const familyMatch=state.activeFamily==="all"||familyForRepo(repo.name)===state.activeFamily;
      return queryMatch&&stateMatch&&familyMatch;
    });
    if(els.projectCount)els.projectCount.textContent=`${repos.length} public repositor${repos.length===1?"y":"ies"} shown`;
    if(!repos.length){els.projectGrid.innerHTML='<article class="project-skeleton">No public repositories match the current search/filter/constellation.</article>';return;}
    els.projectGrid.innerHTML=repos.map(repo=>{
      const family=familyForRepo(repo.name);
      const visuals=evidenceForRepo(repo.name);
      const visual=visuals.find(item=>item.type==="runtime")||visuals.find(item=>item.type==="source")||visuals[0]||null;
      const visualLabel=visual?(visual.type==="runtime"?"ACTUAL CAPTURE":visual.type==="source"?"SOURCE-VERIFIED UI":"PROJECT VISUAL"):"NO MAPPED VISUAL";
      return `
      <article class="project-card dossier-project-card family-${escapeHtml(family)} ${visual?"has-card-visual":"no-card-visual"}" data-project="${escapeHtml(repo.name)}">
        ${visual?`<button class="project-card-visual" type="button" data-project-visual="${escapeHtml(visual.slug)}" aria-label="Open ${escapeHtml(visual.title)}">
          <img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt||visual.title)}" loading="lazy" decoding="async">
          <span class="project-visual-badge ${escapeHtml(visual.type)}">${escapeHtml(visualLabel)}</span>
          <i>OPEN VISUAL ↗</i>
        </button>`:`<div class="project-card-no-visual"><span>DPN://PUBLIC_SOURCE</span><b>${escapeHtml(repo.name.replaceAll("-"," "))}</b><small>Visual evidence not mapped yet</small></div>`}
        <div class="project-card-body">
          <div class="project-meta"><span>PUBLIC</span><span>${escapeHtml(languageLabel(repo))}</span><span>${escapeHtml(FAMILY_LABELS[family]||"DPN PRODUCT")}</span></div>
          <h3>${escapeHtml(repo.name)}</h3>
          <p>${escapeHtml(repo.description||"Public DPN Technology source repository. Inspect the dossier for repository-specific public evidence.")}</p>
          <div class="project-card-signal">
            <span><b>${escapeHtml(fmtDate(repo.pushed_at))}</b><small>LAST PUSH</small></span>
            <span><b>${repo.open_issues_count||0}</b><small>ISSUES</small></span>
            <span><b>${releaseRepos.has(repo.name)?"YES":"NO"}</b><small>RELEASE</small></span>
            <span><b>${visuals.length}</b><small>VISUALS</small></span>
          </div>
          <div class="project-stats"><span class="repo-stars">★ ${repo.stargazers_count||0}</span><span class="repo-forks">⑂ ${repo.forks_count||0}</span><span>BRANCH ${escapeHtml(repo.default_branch||"main")}</span></div>
          <div class="project-footer project-actions"><button type="button" data-open-dossier="${escapeHtml(repo.name)}">INSPECT DOSSIER</button><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">OPEN REPOSITORY ↗</a></div>
        </div>
      </article>`;
    }).join("");
    els.projectGrid.querySelectorAll("[data-open-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.openDossier)));
    els.projectGrid.querySelectorAll("[data-project-visual]").forEach(button=>button.addEventListener("click",()=>openEvidenceBySlug(button.dataset.projectVisual)));
  }
  function renderActivity() {
    if (!els.activity) return;
    const repos = [...state.repos]
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 8);

    if (!repos.length) {
      els.activity.innerHTML = '<p class="feed-empty">No public repository activity is currently discoverable.</p>';
      return;
    }

    els.activity.innerHTML = repos.map(repo => `
      <a class="activity-item" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
        <time datetime="${escapeHtml(repo.pushed_at)}">${escapeHtml(relativeAge(repo.pushed_at))}</time>
        <div><strong>${escapeHtml(repo.name)}</strong><span>${escapeHtml(repo.description || "Public repository update")}</span></div>
        <b>PUSH</b>
      </a>
    `).join("");
  }

  function renderLanguages() {
    if (!els.languageBars) return;
    const entries = [...state.languageCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      els.languageBars.innerHTML = '<p class="feed-empty">No public language metadata is available.</p>';
      return;
    }

    const max = Math.max(...entries.map(([, count]) => count), 1);
    els.languageBars.innerHTML = entries.slice(0, 8).map(([name, count]) => `
      <div class="language-row">
        <div class="language-row-head"><span>${escapeHtml(name)}</span><span>${count} repo${count === 1 ? "" : "s"}</span></div>
        <div class="language-track"><div class="language-fill" style="width:${Math.max(8, (count / max) * 100)}%"></div></div>
      </div>
    `).join("");
  }

  function renderReleases(){
    if(!els.releaseFeed)return;
    const releases=state.releases.slice(0,12);
    if(!releases.length){els.releaseFeed.innerHTML='<p class="feed-empty">No public GitHub release records are currently discoverable.</p>';return;}
    els.releaseFeed.innerHTML=releases.map((release,index)=>`
      <button type="button" class="release-item release-inspect" data-release-index="${index}">
        <span class="release-badge">${release.prerelease?"PREVIEW":"RELEASE"}</span>
        <div class="release-copy"><strong>${escapeHtml(release.repo)} // ${escapeHtml(release.tag)}</strong><span>${escapeHtml(release.name)}</span></div>
        <time datetime="${escapeHtml(release.published_at)}">${escapeHtml(fmtDate(release.published_at))}</time>
      </button>`).join("");
    els.releaseFeed.querySelectorAll("[data-release-index]").forEach(button=>button.addEventListener("click",()=>openReleaseInspector(Number(button.dataset.releaseIndex))));
  }
  function renderFusionMesh() {
    const releaseRepos = releaseRepoSet();
    const recentRepos = state.repos.filter(isRecent);
    const eventCount = state.repos.length + state.releases.length;

    if (els.meshState) els.meshState.textContent = "REGISTRY SYNCHRONIZED";
    if (els.meshNodes) els.meshNodes.textContent = String(state.repos.length + 3);
    if (els.meshReleaseSources) els.meshReleaseSources.textContent = String(releaseRepos.size);
    if (els.meshRecent) els.meshRecent.textContent = String(recentRepos.length);
    if (els.meshEvents) els.meshEvents.textContent = String(eventCount);
    if (els.meshEventState) els.meshEventState.textContent = "PUBLIC SIGNAL ONLINE";

    renderTopology();
    renderMeshEvents();
  }

  function renderTopology() {
    if (!els.topology) return;
    const repos = state.repos.slice(0, 12);
    const nodes = [
      { id:"org", label:"DPN GITHUB", sub:"ORGANIZATION", type:"surface", url:"https://github.com/DPN-Technology" },
      { id:"hub", label:"ENGINEERING HUB", sub:".github", type:"surface", url:"https://github.com/DPN-Technology/.github" },
      { id:"site", label:"COMMAND CENTER", sub:"PUBLIC SITE", type:"surface", url:"https://dpn-technology.github.io/" },
      ...repos.map(repo => ({
        id:repo.name,
        label:repo.name.replace(/^DPN-/,"DPN ").slice(0,24),
        sub:repo.language || "PUBLIC SOURCE",
        type:"repo",
        url:repo.html_url,
        repo
      }))
    ];

    const center={x:550,y:310};
    const radius=225;
    const positioned=nodes.map((node,index) => {
      const angle=(-Math.PI/2)+(index*(Math.PI*2/nodes.length));
      return {...node,x:center.x+Math.cos(angle)*radius,y:center.y+Math.sin(angle)*radius};
    });

    const edges=positioned.map(node =>
      `<path class="topology-edge ${node.type === "surface" ? "surface" : ""}" data-edge="${escapeHtml(node.id)}" d="M${center.x} ${center.y} L${node.x.toFixed(1)} ${node.y.toFixed(1)}"></path>`
    ).join("");

    const nodeMarkup=positioned.map(node => {
      const r=node.type==="surface"?42:36;
      return `<g class="topology-node ${node.type} family-${node.repo ? familyForRepo(node.repo.name) : "surface"}" tabindex="0" role="button" data-node="${escapeHtml(node.id)}" transform="translate(${node.x.toFixed(1)} ${node.y.toFixed(1)})">
        <circle r="${r}"></circle>
        <text text-anchor="middle" y="-2">${escapeHtml(node.label)}</text>
        <text class="node-sub" text-anchor="middle" y="14">${escapeHtml(node.sub)}</text>
      </g>`;
    }).join("");

    els.topology.innerHTML=`
      <g class="mesh-edges">${edges}</g>
      <g class="topology-node topology-core" tabindex="0" role="button" data-node="core" transform="translate(${center.x} ${center.y})">
        <circle r="72"></circle>
        <image href="./assets/dpn-logo.webp" x="-52" y="-52" width="104" height="104"></image>
        <text class="node-sub" text-anchor="middle" y="90">DPN PUBLIC CORE</text>
      </g>
      ${nodeMarkup}
    `;

    const nodeMap=new Map(positioned.map(node=>[node.id,node]));
    els.topology.querySelectorAll("[data-node]").forEach(nodeEl => {
      const activate=() => openMeshDrawer(nodeEl.dataset.node,nodeMap);
      nodeEl.addEventListener("click",activate);
      nodeEl.addEventListener("keydown",event => {
        if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}
      });
    });
  }

  function openMeshDrawer(id,nodeMap=new Map()){
    if(!els.meshDrawer||!els.meshDrawerTitle||!els.meshDrawerBody)return;
    els.topology?.querySelectorAll("[data-node]").forEach(node=>node.classList.toggle("selected",node.dataset.node===id));
    els.topology?.querySelectorAll("[data-edge]").forEach(edge=>edge.classList.toggle("selected",edge.dataset.edge===id));
    if(id==="core"){
      els.meshDrawerTitle.textContent="DPN PUBLIC CORE";
      els.meshDrawerBody.innerHTML=`<p>Public GitHub organization surfaces and intentionally public repositories.</p><dl><div><dt>RELATIONSHIP TYPE</dt><dd>Registry / discovery</dd></div><div><dt>RUNTIME CLAIM</dt><dd>None. This is not a live application/network topology.</dd></div><div><dt>PRIVACY</dt><dd>Private repository inventory is suppressed.</dd></div><div><dt>PUBLIC PROJECTS</dt><dd>${state.repos.length}</dd></div><div><dt>VISUAL EVIDENCE</dt><dd>${evidenceCatalog().length} public-safe visual items</dd></div></dl>`;
    }else{
      const node=nodeMap.get(id);if(!node)return;els.meshDrawerTitle.textContent=node.label;
      if(node.repo){
        const hasRelease=releaseRepoSet().has(node.repo.name);
        const visuals=evidenceForRepo(node.repo.name);
        const releases=state.releases.filter(item=>item.repo===node.repo.name);
        const ev=state.evidence.get(node.repo.name);
        els.meshDrawerBody.innerHTML=`<p>${escapeHtml(node.repo.description||"Public DPN Technology source repository.")}</p><dl>
          <div><dt>TYPE</dt><dd>Public project repository</dd></div><div><dt>CONSTELLATION</dt><dd>${escapeHtml(FAMILY_LABELS[familyForRepo(node.repo.name)]||"DPN PRODUCT")}</dd></div><div><dt>PRIMARY LANGUAGE</dt><dd>${escapeHtml(node.repo.language||"Unspecified")}</dd></div><div><dt>LAST PUBLIC PUSH</dt><dd>${escapeHtml(fmtDate(node.repo.pushed_at))}</dd></div><div><dt>PUBLIC RELEASE RECORD</dt><dd>${hasRelease?`${releases.length} discoverable`:"None discovered in current API window"}</dd></div><div><dt>VISUAL EVIDENCE</dt><dd>${visuals.length} matching item${visuals.length===1?"":"s"}</dd></div><div><dt>REPOSITORY EVIDENCE</dt><dd>${ev?.error?"Unknown — API error":ev?[ev.readme,ev.security,ev.license,ev.architecture].filter(Boolean).length+" artifact classes discovered":"Not scanned"}</dd></div></dl>
          <div class="mesh-drawer-actions"><button type="button" data-mesh-dossier="${escapeHtml(node.repo.name)}">OPEN PROJECT DOSSIER</button>${visuals[0]?`<button type="button" data-mesh-evidence="${escapeHtml(visuals[0].slug)}">OPEN VISUAL EVIDENCE</button>`:""}<a href="${escapeHtml(node.repo.html_url)}" target="_blank" rel="noreferrer">OPEN PUBLIC REPOSITORY ↗</a></div>`;
        els.meshDrawerBody.querySelector("[data-mesh-dossier]")?.addEventListener("click",()=>openProjectDossier(node.repo.name));
        els.meshDrawerBody.querySelector("[data-mesh-evidence]")?.addEventListener("click",event=>openEvidenceBySlug(event.currentTarget.dataset.meshEvidence));
      }else{
        els.meshDrawerBody.innerHTML=`<p>Public DPN organization surface.</p><dl><div><dt>TYPE</dt><dd>Public organization interface</dd></div><div><dt>RELATIONSHIP</dt><dd>Linked from the DPN GitHub public core</dd></div></dl><a href="${escapeHtml(node.url)}" target="_blank" rel="noreferrer">OPEN SURFACE ↗</a>`;
      }
    }
    els.meshDrawer.classList.add("open");els.meshDrawer.setAttribute("aria-hidden","false");setDeepLink("mesh",id);setBrowserContext(`Fusion Mesh // ${els.meshDrawerTitle.textContent}`,"Public DPN GitHub registry relationship view. Not a runtime network topology.");
  }
  function renderMeshEvents() {
    if (!els.meshConsole) return;
    const pushes=state.repos.map(repo=>({
      type:"PUSH",date:repo.pushed_at,title:repo.name,detail:"Public repository push signal"
    }));
    const releases=state.releases.map(release=>({
      type:release.prerelease?"PREVIEW":"RELEASE",date:release.published_at,title:release.repo,detail:release.tag
    }));
    const events=[...pushes,...releases].filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,12);
    els.meshConsole.innerHTML=events.length?events.map(event=>`
      <div class="mesh-event">
        <time>${escapeHtml(relativeAge(event.date))}</time>
        <span><b>[${escapeHtml(event.type)}]</b> ${escapeHtml(event.title)} // ${escapeHtml(event.detail)}</span>
        <em>${escapeHtml(fmtDate(event.date))}</em>
      </div>`).join(""):'<p>NO PUBLIC EVENTS DISCOVERED.</p>';
  }

  function renderBuildJournal(){
    if(!els.journal)return;
    const releaseEntries=state.releases.slice(0,6).map(release=>({type:release.prerelease?"PUBLIC PREVIEW":"PUBLIC RELEASE",date:release.published_at,title:`${release.repo} // ${release.tag}`,body:release.name,url:release.url,repo:release.repo}));
    const pushEntries=[...state.repos].sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,6).map(repo=>({type:"PUBLIC SOURCE UPDATE",date:repo.pushed_at,title:repo.name,body:repo.description||"Public repository received a GitHub push update.",url:repo.html_url,repo:repo.name}));
    const entries=[...releaseEntries,...pushEntries].filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);
    els.journal.innerHTML=entries.length?entries.map(entry=>{
      const visual=evidenceForRepo(entry.repo)[0];
      return `<article class="journal-entry visual-journal">
        ${visual?`<button type="button" class="journal-thumb" data-evidence-slug="${escapeHtml(visual.slug)}"><img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt)}"></button>`:'<div class="journal-thumb journal-no-thumb">DPN</div>'}
        <span>${escapeHtml(entry.type)}<br>${escapeHtml(fmtDate(entry.date))}</span>
        <div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.body)}</p></div>
        <a href="${escapeHtml(entry.url)}" target="_blank" rel="noreferrer">OPEN PUBLIC EVIDENCE ↗</a>
      </article>`;
    }).join(""):'<p class="feed-empty">No public GitHub journal records discovered.</p>';
    els.journal.querySelectorAll("[data-evidence-slug]").forEach(button=>button.addEventListener("click",()=>openEvidenceBySlug(button.dataset.evidenceSlug)));
  }
  function renderFusionFallback() {
    if (els.meshState) els.meshState.textContent="REGISTRY UNAVAILABLE";
    for(const el of [els.meshNodes,els.meshReleaseSources,els.meshRecent,els.meshEvents]) if(el)el.textContent="N/A";
    if(els.meshEventState)els.meshEventState.textContent="PUBLIC SIGNAL UNAVAILABLE";
    if(els.meshConsole)els.meshConsole.innerHTML="<p>PUBLIC GITHUB REGISTRY UNAVAILABLE. STATIC ARCHITECTURE REMAINS AVAILABLE.</p>";
  }

  function renderJournalFallback() {
    if(els.journal)els.journal.innerHTML='<p class="feed-empty">Public build journal unavailable while GitHub API access is unavailable.</p>';
  }

  function artifactUrl(repo,path) {
    if(!repo || !path)return "";
    const branch=encodeURIComponent(repo.default_branch || "main");
    const encodedPath=String(path).split("/").map(encodeURIComponent).join("/");
    return `${repo.html_url}/blob/${branch}/${encodedPath}`;
  }

  function evidenceMark(value,label,kind="",url="") {
    const className=`evidence-mark ${value ? (kind || "present") : "absent"}`;
    const text=value ? "● " + label : "○ NOT FOUND";
    if(value && url){
      return `<a class="${className} evidence-artifact" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" title="Open discovered public artifact">${text}</a>`;
    }
    return `<span class="${className}">${text}</span>`;
  }

  function renderEvidenceMatrix() {
    if (!els.evidenceBody) return;
    const releaseRepos=releaseRepoSet();
    const scanned=[...state.evidence.entries()];
    const repoMap=new Map(state.repos.map(repo=>[repo.name,repo]));

    const counts={
      readme:0,security:0,license:0,architecture:0,release:0
    };

    const rows=scanned.map(([name,evidence])=>{
      const repo=repoMap.get(name);
      if(!repo)return "";
      if(evidence.readme)counts.readme++;
      if(evidence.security)counts.security++;
      if(evidence.license)counts.license++;
      if(evidence.architecture)counts.architecture++;
      if(releaseRepos.has(name))counts.release++;

      const repoUrl=repo.html_url;
      const paths=evidence.paths || {};
      const release=state.releases.find(item=>item.repo===name);
      const evidenceStatus=evidence.error
        ? '<span class="evidence-mark absent">API UNAVAILABLE</span>'
        : evidenceMark(evidence.readme,"FOUND","present",artifactUrl(repo,paths.readme));
      const repoFlags=[evidence.treeTruncated ? "PARTIAL TREE" : "",evidence.cached ? "CACHE" : ""].filter(Boolean).join(" // ");

      return `<tr>
        <td class="evidence-repo">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(repo.language || "Language unspecified")} // ${escapeHtml(fmtDate(repo.pushed_at))}${repoFlags ? " // " + escapeHtml(repoFlags) : ""}</span>
        </td>
        <td class="evidence-cell">${evidenceStatus}</td>
        <td class="evidence-cell">${evidence.error ? '<span class="evidence-mark absent">UNKNOWN</span>' : evidenceMark(evidence.security,"FOUND","present",artifactUrl(repo,paths.security))}</td>
        <td class="evidence-cell">${evidence.error ? '<span class="evidence-mark absent">UNKNOWN</span>' : evidenceMark(evidence.license,"FOUND","present",artifactUrl(repo,paths.license))}</td>
        <td class="evidence-cell">${evidence.error ? '<span class="evidence-mark absent">UNKNOWN</span>' : evidenceMark(evidence.architecture,"FOUND","present",artifactUrl(repo,paths.architecture))}</td>
        <td class="evidence-cell">${evidenceMark(releaseRepos.has(name),"DISCOVERED","release",release?.url || "")}</td>
        <td class="evidence-cell">${evidenceMark(isRecent(repo),"30D","recent")}</td>
        <td><a class="evidence-inspect" href="${escapeHtml(repoUrl)}" target="_blank" rel="noreferrer">OPEN REPO ↗</a></td>
      </tr>`;
    }).join("");

    els.evidenceBody.innerHTML=rows || '<tr><td colspan="8" class="evidence-loading">No public repository evidence could be scanned.</td></tr>';

    if(els.evidenceRepos)els.evidenceRepos.textContent=String(scanned.length);
    if(els.evidenceReadmes)els.evidenceReadmes.textContent=String(counts.readme);
    if(els.evidenceSecurity)els.evidenceSecurity.textContent=String(counts.security);
    if(els.evidenceLicense)els.evidenceLicense.textContent=String(counts.license);
    if(els.evidenceArchitecture)els.evidenceArchitecture.textContent=String(counts.architecture);
    if(els.evidenceRelease)els.evidenceRelease.textContent=String(counts.release);

    const failed=scanned.filter(([,value])=>value.error).length;
    if(els.evidenceState){
      els.evidenceState.textContent=failed
        ? `PARTIAL // ${failed} API ERROR${failed===1?"":"S"} // ${state.evidenceCacheHits} CACHED`
        : `SCANNED // ${scanned.length} REPOS // ${state.evidenceCacheHits} CACHED`;
      els.evidenceState.className=failed?"partial":"online";
    }
  }

  function renderEvidenceFallback() {
    if(els.evidenceState){
      els.evidenceState.textContent="PUBLIC EVIDENCE API UNAVAILABLE";
      els.evidenceState.className="partial";
    }
    if(els.evidenceBody)els.evidenceBody.innerHTML='<tr><td colspan="8" class="evidence-loading">Public repository evidence could not be inspected. Static standards remain available.</td></tr>';
    for(const el of [els.evidenceRepos,els.evidenceReadmes,els.evidenceSecurity,els.evidenceLicense,els.evidenceArchitecture,els.evidenceRelease]) if(el)el.textContent="N/A";
  }

  function renderFallback() {
    if (!els.projectGrid) return;
    els.projectGrid.innerHTML = `
      <a class="project-card" href="https://github.com/DPN-Technology" target="_blank" rel="noreferrer">
        <div class="project-meta"><span>PUBLIC DISCOVERY</span><span>GITHUB</span></div>
        <h3>DPN Technology Public Repositories</h3>
        <p>Live API telemetry could not be loaded. Open the DPN Technology organization directly to inspect currently public repositories.</p>
        <div class="project-footer"><span>OPEN ORGANIZATION</span><span>↗</span></div>
      </a>`;
  }

  function renderActivityFallback() {
    if (els.activity) els.activity.innerHTML = '<p class="feed-empty">Public GitHub activity feed unavailable. Static engineering content remains online.</p>';
    if (els.languageBars) els.languageBars.innerHTML = '<p class="feed-empty">Public language telemetry unavailable.</p>';
  }

  function renderReleaseFallback() {
    if (els.releaseFeed) els.releaseFeed.innerHTML = '<p class="feed-empty">Public release discovery unavailable. Open public repositories directly for release records.</p>';
  }

  function renderArchitecture(key){
    const item=architecture[key];
    if(!item||!els.fabricDetail)return;
    document.querySelectorAll(".fabric-node").forEach(node=>node.classList.toggle("active",node.dataset.arch===key));
    const products=(ARCH_PRODUCTS[key]||[]).map(name=>{
      const repo=state.repos.find(item=>item.name===name);
      return repo?`<button type="button" data-arch-project="${escapeHtml(name)}">${escapeHtml(name)}</button>`:`<span>${escapeHtml(name)}</span>`;
    }).join("");
    els.fabricDetail.innerHTML=`
      <p class="eyebrow">${escapeHtml(item.code)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
      <dl><div><dt>CONTROL</dt><dd>${escapeHtml(item.control)}</dd></div><div><dt>EVIDENCE</dt><dd>${escapeHtml(item.evidence)}</dd></div><div><dt>RECOVERY</dt><dd>${escapeHtml(item.recovery)}</dd></div></dl>
      <div class="architecture-products"><small>RELATED PUBLIC PRODUCT SURFACES</small><div>${products||"<span>Shared engineering doctrine</span>"}</div></div>
      <div class="arch-links">${item.links.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`).join("")}</div>`;
    els.fabricDetail.querySelectorAll("[data-arch-project]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.archProject)));
    setBrowserContext(item.title,item.description);
    addTerminal("ARCH",`Loaded architecture node: ${item.title}`);
  }
  function setupArchitecture() {
    document.querySelectorAll(".fabric-node").forEach(node => {
      node.addEventListener("click", () => {
        renderArchitecture(node.dataset.arch);
        setDeepLink("arch",node.dataset.arch);
      });
    });
    const direct=new URL(location.href).searchParams.get("arch");
    renderArchitecture(architecture[direct] ? direct : "core");
  }

  function setupCommandPalette(){
    if(!els.palette||!els.launcher)return;
    const open=()=>{if(typeof els.palette.showModal==="function"&&!els.palette.open)els.palette.showModal();els.paletteSearch?.focus();addTerminal("CMD","Command palette opened");};
    const close=()=>{if(els.palette.open)els.palette.close();};
    const closeAndGo=target=>{close();document.getElementById(target)?.scrollIntoView({behavior:"smooth",block:"start"});addTerminal("NAV",`Command jump: ${target}`);};
    els.launcher.addEventListener("click",open);$("mobile-command-launcher")?.addEventListener("click",open);
    window.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();if(els.palette.open)close();else open();}});
    els.paletteResults?.addEventListener("click",event=>{
      const button=event.target.closest("button");if(!button)return;
      if(button.dataset.target)return closeAndGo(button.dataset.target);
      if(button.dataset.project){close();return openProjectDossier(button.dataset.project);}
      if(button.dataset.evidence){close();return openEvidenceBySlug(button.dataset.evidence);}
      if(button.dataset.action==="actual-captures"){close();document.getElementById("inside-builds")?.scrollIntoView({behavior:"smooth"});document.querySelector('[data-evidence-filter="runtime"]')?.click();}
      if(button.dataset.action==="capture-gaps"){close();$("show-capture-gaps")?.click();}
    });
    els.paletteSearch?.addEventListener("input",()=>{const q=els.paletteSearch.value.trim().toLowerCase();[...els.paletteResults.querySelectorAll("button")].forEach(button=>{button.hidden=Boolean(q)&&!button.textContent.toLowerCase().includes(q);});});
  }
  function setupClock() {
    if (!els.clock) return;
    const tick = () => {
      const now = new Date();
      els.clock.dateTime = now.toISOString();
      els.clock.textContent = now.toLocaleTimeString([], { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  function setupDpnStorm() {
    const binary = $("binary-rain");
    const lightning = $("lightning-canvas");
    const flash = $("page-flash");
    if (!binary || !lightning || !flash) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const bctx = binary.getContext("2d");
    const lctx = lightning.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = [];
    let lastBolt = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = window.innerWidth;
      h = window.innerHeight;

      for (const canvas of [binary, lightning]) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const size = w < 700 ? 15 : 18;
      cols = Array.from({ length: Math.ceil(w / size) }, (_, i) => ({
        y: -Math.random() * h,
        speed: 1 + Math.random() * 1.5,
        phase: i % 9
      }));
    }

    function rain(t) {
      bctx.fillStyle = "rgba(3,3,5,.10)";
      bctx.fillRect(0, 0, w, h);
      bctx.font = `800 ${w < 700 ? 14 : 17}px Consolas, monospace`;
      const cw = w / Math.max(cols.length, 1);

      cols.forEach((col, i) => {
        for (let j = 0; j < 7; j++) {
          const y = col.y - j * 22;
          if (y < -20 || y > h + 20) continue;

          bctx.fillStyle = j === 0
            ? "rgba(255,95,112,.95)"
            : `rgba(255,22,55,${Math.max(.05, .48 - j * .055)})`;
          bctx.shadowBlur = j === 0 ? 12 : 0;
          bctx.shadowColor = "#ff1738";
          bctx.fillText(
            ((Math.floor(t / 170) + i + j + col.phase) % 2).toString(),
            i * cw,
            y
          );
        }

        col.y += col.speed;
        if (col.y > h + 160) col.y = -Math.random() * 280;
      });

      bctx.shadowBlur = 0;
    }

    function bolt(sx, sy, ex, ey, depth = 0) {
      const pts = [[sx, sy]];
      const count = Math.max(8, Math.floor(Math.hypot(ex - sx, ey - sy) / 52));

      for (let i = 1; i < count; i++) {
        const fraction = i / count;
        const spread = depth ? 16 : 32;
        pts.push([
          sx + (ex - sx) * fraction + (Math.random() - .5) * spread,
          sy + (ey - sy) * fraction + (Math.random() - .5) * spread
        ]);
      }
      pts.push([ex, ey]);

      for (const [width, alpha, blur] of [[6, .07, 20], [2, .42, 10], [.7, .96, 3]]) {
        lctx.lineWidth = width;
        lctx.strokeStyle = `rgba(255,${depth ? 40 : 85},${depth ? 58 : 105},${alpha})`;
        lctx.shadowBlur = blur;
        lctx.shadowColor = "#ff1738";
        lctx.beginPath();
        pts.forEach((point, index) => {
          if (index) lctx.lineTo(point[0], point[1]);
          else lctx.moveTo(point[0], point[1]);
        });
        lctx.stroke();
      }

      if (depth < 1) {
        for (let i = 3; i < pts.length - 2; i += 5) {
          if (Math.random() < .45) {
            const point = pts[i];
            const dir = Math.random() < .5 ? -1 : 1;
            bolt(
              point[0],
              point[1],
              point[0] + dir * (45 + Math.random() * 80),
              point[1] + 45 + Math.random() * 90,
              1
            );
          }
        }
      }
      lctx.shadowBlur = 0;
    }

    function triggerLightning(t) {
      const interval = 1100 + Math.random() * 1600;
      if (t - lastBolt <= interval) return;
      lastBolt = t;

      lctx.clearRect(0, 0, w, h);
      const startX = w * (.12 + Math.random() * .76);
      const endX = w * (.18 + Math.random() * .65);
      const endY = h * (.3 + Math.random() * .55);

      bolt(startX, -20, endX, endY);

      flash.animate(
        [{ opacity: 0 }, { opacity: .24 }, { opacity: .04 }, { opacity: 0 }],
        { duration: 230, easing: "linear" }
      );

      setTimeout(() => lctx.clearRect(0, 0, w, h), 250);
    }

    let frameCount = 0;
    function frame(t) {
      frameCount++;
      const mode = document.documentElement.dataset.visualMode || "full";
      const stormOff = document.documentElement.classList.contains("storm-off");
      if (!stormOff && mode !== "low") {
        if (mode === "full" || frameCount % 2 === 0) rain(t);
        if (mode === "full" || frameCount % 2 === 0) triggerLightning(t);
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(frame);
    addTerminal("VISUAL", "DPN Website-matched binary storm online");
  }

  function setupStormToggle() {
    if (!els.stormToggle) return;
    let enabled=true;
    els.stormToggle.addEventListener("click", () => {
      enabled=!enabled;
      document.documentElement.classList.toggle("storm-off",!enabled);
      els.stormToggle.setAttribute("aria-pressed",String(enabled));
      els.stormToggle.textContent=enabled?"⚡ STORM // HIGH":"⚡ STORM // OFF";
      addTerminal("VISUAL",enabled?"DPN binary storm enabled":"DPN binary storm disabled");
    });
  }

  function setupVisualEvidenceRegistry() {
    const wall = document.querySelector(".evidence-wall");
    const registry = document.querySelector(".visual-evidence-registry");
    if (!wall || !registry) return;

    const figures = [...wall.querySelectorAll("figure")];
    const buttons = [...registry.querySelectorAll("[data-evidence-filter]")];
    const platformButtons=[...registry.querySelectorAll("[data-platform-filter]")];
    const search = $("visual-evidence-search");
    const counters = {
      all: $("visual-count-all"),
      runtime: $("visual-count-runtime"),
      source: $("visual-count-source"),
      artwork: $("visual-count-art"),
      visible: $("visual-count-visible")
    };

    const items=evidenceCatalog();
    const typeOf = (figure) => figure.classList.contains("evidence-runtime")
      ? "runtime"
      : figure.classList.contains("evidence-source")
        ? "source"
        : figure.classList.contains("evidence-artwork")
          ? "artwork"
          : "other";

    const totals = figures.reduce((acc, figure) => {
      const type = typeOf(figure);
      acc.all++;
      if (type in acc) acc[type]++;
      return acc;
    }, { all: 0, runtime: 0, source: 0, artwork: 0 });

    for (const key of ["all", "runtime", "source", "artwork"]) {
      if (counters[key]) counters[key].textContent = String(totals[key]);
    }

    let activeFilter = "all";
    let activePlatform = "all";
    const apply = (filter = activeFilter, platform = activePlatform) => {
      activeFilter = filter;
      activePlatform = platform;
      const query = String(search?.value || "").trim().toLowerCase();
      let visible = 0;
      figures.forEach((figure,index) => {
        const typeMatch = filter === "all" || typeOf(figure) === filter;
        const item=items[index];
        const itemPlatform=item?.platform || figure.dataset.platform || "web";
        const platformMatch=platform==="all" || itemPlatform===platform;
        const searchMatch = !query || String(figure.textContent || "").toLowerCase().includes(query) || [...figure.querySelectorAll("img")].some(img => String(img.alt || "").toLowerCase().includes(query));
        const show = typeMatch && platformMatch && searchMatch;
        figure.hidden = !show;
        if (show) visible++;
      });
      buttons.forEach(button => {
        const active = button.dataset.evidenceFilter === filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      platformButtons.forEach(button=>{
        const active=button.dataset.platformFilter===platform;
        button.classList.toggle("active",active);
        button.setAttribute("aria-pressed",String(active));
      });
      if (counters.visible) counters.visible.textContent = String(visible);
      registry.dataset.activeFilter = filter;
      registry.dataset.activePlatform = platform;
      addTerminal("EVIDENCE", `Visual evidence: ${filter.toUpperCase()} / ${platform.toUpperCase()} // ${visible} visible`);
    };

    buttons.forEach(button => button.addEventListener("click", () => apply(button.dataset.evidenceFilter || "all",activePlatform)));
    platformButtons.forEach(button=>button.addEventListener("click",()=>apply(activeFilter,button.dataset.platformFilter||"all")));
    search?.addEventListener("input", () => apply());
    apply("all","all");
  }
  function openEvidenceBySlug(slug,{updateUrl=true}={}){
    const items=evidenceCatalog();const index=items.findIndex(item=>item.slug===slug);if(index<0)return;openEvidence(index,{updateUrl});
  }

  function openEvidence(index,{updateUrl=true}={}){
    const items=evidenceCatalog();if(!items.length)return;
    const safeIndex=(index+items.length)%items.length;const item=items[safeIndex];state.evidenceIndex=safeIndex;
    const dialog=$("evidence-inspector"),image=$("evidence-inspector-image"),title=$("evidence-inspector-title"),type=$("evidence-inspector-type"),stamp=$("evidence-inspector-stamp"),description=$("evidence-inspector-description"),details=$("evidence-inspector-details"),repoLink=$("evidence-repo-link");
    if(!dialog||!image)return;
    image.src=item.src;image.alt=item.alt;if(title)title.textContent=item.title;
    if(type)type.textContent=item.type==="runtime"?"ACTUAL CAPTURE":item.type==="source"?"SOURCE-DERIVED INTERFACE":"PROJECT ARTWORK";
    if(stamp)stamp.textContent=item.stamp;if(description)description.textContent=item.description;
    if(details)details.innerHTML=`<div><dt>EVIDENCE TYPE</dt><dd>${escapeHtml(item.type.toUpperCase())}</dd></div><div><dt>PLATFORM</dt><dd>${escapeHtml((item.platform||"web").toUpperCase())}</dd></div><div><dt>INDEX</dt><dd>${safeIndex+1} / ${items.length}</dd></div><div><dt>PUBLIC SOURCE</dt><dd>${escapeHtml(item.repo||"Command Center project evidence")}</dd></div><div><dt>CLAIM BOUNDARY</dt><dd>${item.type==="runtime"?"Captured project/interface output; not production health.":item.type==="source"?"Derived from current visible source structure; not a runtime screenshot.":"Identity artwork; not application evidence."}</dd></div>`;
  const provenanceBox=$("evidence-provenance");
  if(provenanceBox){
    const provenance=item.provenance;
    if(provenance?.files?.length){
      provenanceBox.innerHTML=`<div class="provenance-head"><span>VERIFIED PUBLIC SOURCE PROVENANCE</span><b>${escapeHtml(provenance.note||"Source-backed visual")}</b></div><div class="provenance-files">${provenance.files.map(path=>`<a href="${escapeHtml(publicSourceFileUrl(provenance.repo,path))}" target="_blank" rel="noreferrer"><span>EXACT SOURCE FILE</span><b>${escapeHtml(path)}</b>↗</a>`).join("")}</div>`;
    }else{
      provenanceBox.innerHTML=`<div class="provenance-head"><span>VISUAL PROVENANCE</span><b>${item.type==="runtime"?"Captured project/output evidence asset.":item.type==="artwork"?"Project identity artwork.":"No exact source-file mapping registered."}</b></div>`;
    }
  }
    const repo=state.repos.find(repo=>repo.name===item.repo);if(repoLink)repoLink.href=repo?.html_url||`https://github.com/${ORG}`;
    document.documentElement.dataset.productTheme=productThemeFor(item);$("evidence-compare")?.setAttribute("hidden","");setBrowserContext(item.title,item.description);
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("evidence",item.slug);addTerminal("EVIDENCE",`Opened visual evidence: ${item.title}`);
  }

  function closeEvidenceInspector(){
    const dialog=$("evidence-inspector");if(dialog?.open)dialog.close();delete document.documentElement.dataset.productTheme;clearDeepLink("evidence");resetBrowserContext();
  }

  function renderEvidenceCompare(){
    const compare=$("evidence-compare");if(!compare)return;const items=evidenceCatalog(),current=items[state.evidenceIndex],pinned=items.find(item=>item.slug===state.evidencePinnedSlug);
    if(!pinned||!current||pinned.slug===current.slug){compare.hidden=false;compare.innerHTML='<div class="compare-empty">Pin one visual, open another, then compare them side by side.</div>';return;}
    compare.hidden=false;compare.innerHTML=`<figure><img src="${escapeHtml(pinned.src)}" alt="${escapeHtml(pinned.alt)}"><figcaption><b>${escapeHtml(pinned.title)}</b><span>${escapeHtml(pinned.type.toUpperCase())}</span></figcaption></figure><div class="compare-vs">VS</div><figure><img src="${escapeHtml(current.src)}" alt="${escapeHtml(current.alt)}"><figcaption><b>${escapeHtml(current.title)}</b><span>${escapeHtml(current.type.toUpperCase())}</span></figcaption></figure>`;
  }

  function setupEvidenceInspector(){
    const wall=document.querySelector(".evidence-wall");if(!wall)return;
    evidenceCatalog().forEach(item=>{item.figure.tabIndex=0;item.figure.setAttribute("role","button");item.figure.setAttribute("aria-label",`Inspect visual evidence: ${item.title}`);const activate=()=>openEvidence(item.index);item.figure.addEventListener("click",activate);item.figure.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}});});
    $("evidence-inspector-close")?.addEventListener("click",closeEvidenceInspector);$("evidence-prev")?.addEventListener("click",()=>openEvidence(state.evidenceIndex-1));$("evidence-next")?.addEventListener("click",()=>openEvidence(state.evidenceIndex+1));
    $("evidence-pin")?.addEventListener("click",()=>{const item=evidenceCatalog()[state.evidenceIndex];if(!item)return;state.evidencePinnedSlug=item.slug;$("evidence-pin").textContent="PINNED ✓";addTerminal("COMPARE",`Pinned evidence: ${item.title}`);});
    $("evidence-compare-toggle")?.addEventListener("click",renderEvidenceCompare);
    $("evidence-share")?.addEventListener("click",async()=>{const item=evidenceCatalog()[state.evidenceIndex];if(!item)return;const url=new URL(location.href);url.searchParams.set("evidence",item.slug);url.searchParams.delete("project");url.searchParams.delete("release");try{await navigator.clipboard.writeText(url.toString());$("evidence-share").textContent="LINK COPIED ✓";setTimeout(()=>{$("evidence-share").textContent="COPY DEEP LINK";},1400);}catch{}});
    window.addEventListener("keydown",event=>{const dialog=$("evidence-inspector");if(!dialog?.open)return;if(event.key==="ArrowLeft"){event.preventDefault();openEvidence(state.evidenceIndex-1);}if(event.key==="ArrowRight"){event.preventDefault();openEvidence(state.evidenceIndex+1);}});
    const direct=new URL(location.href).searchParams.get("evidence");if(direct)requestAnimationFrame(()=>openEvidenceBySlug(direct,{updateUrl:false}));
  }

  function openProjectDossier(repoName,{updateUrl=true}={}){
    const repo=state.repos.find(item=>item.name===repoName),dialog=$("project-dossier");if(!repo||!dialog)return;
    const visuals=evidenceForRepo(repo.name),releases=state.releases.filter(item=>item.repo===repo.name),ev=state.evidence.get(repo.name),artifacts=repoArtifactLinks(repo),title=$("dossier-title"),body=$("dossier-body");
    if(title)title.textContent=repo.name;
    if(body)body.innerHTML=`<section class="dossier-hero"><div><span>${escapeHtml(FAMILY_LABELS[familyForRepo(repo.name)]||"DPN PRODUCT")}</span><h3>${escapeHtml(repo.name)}</h3><p>${escapeHtml(repo.description||"Public DPN Technology source repository.")}</p></div><div class="dossier-kpis"><span><b>${escapeHtml(repo.language||"—")}</b><small>LANGUAGE</small></span><span><b>${releases.length}</b><small>PUBLIC RELEASES</small></span><span><b>${visuals.length}</b><small>VISUAL EVIDENCE</small></span><span><b>${repo.open_issues_count||0}</b><small>OPEN ISSUES</small></span></div></section>
    <section class="dossier-grid"><article><h4>PUBLIC SOURCE STATE</h4><dl><div><dt>LAST PUSH</dt><dd>${escapeHtml(fmtDate(repo.pushed_at))}</dd></div><div><dt>DEFAULT BRANCH</dt><dd>${escapeHtml(repo.default_branch||"main")}</dd></div><div><dt>STARS / FORKS</dt><dd>${repo.stargazers_count||0} / ${repo.forks_count||0}</dd></div><div><dt>RECENT 30D</dt><dd>${isRecent(repo)?"YES":"NO"}</dd></div></dl></article>
    <article><h4>REPOSITORY EVIDENCE</h4>${ev?.error?'<p>Evidence state unknown because the public tree scan failed.</p>':artifacts.length?artifacts.map(([label,url,path])=>`<a class="dossier-artifact" href="${escapeHtml(url)}" target="_blank" rel="noreferrer"><b>${escapeHtml(label)}</b><span>${escapeHtml(path)}</span>↗</a>`).join(""):'<p>No inspected README/security/license/architecture artifact is currently discoverable in the scanned public tree.</p>'}</article></section>
    <section class="dossier-section"><header><h4>VISUAL EVIDENCE</h4><span>${visuals.length} ITEM${visuals.length===1?"":"S"}</span></header><div class="dossier-visuals">${visuals.length?visuals.map(item=>`<button type="button" data-dossier-evidence="${escapeHtml(item.slug)}"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}"><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.type.toUpperCase())}</small></button>`).join(""):'<p>No Command Center visual is currently mapped to this public repository.</p>'}</div></section>
    <section class="dossier-section"><header><h4>PUBLIC RELEASE LINEAGE</h4><span>${releases.length} RECORD${releases.length===1?"":"S"}</span></header><div class="dossier-releases">${releases.length?releases.slice(0,8).map(release=>`<button type="button" data-dossier-release="${escapeHtml(release.repo)}::${escapeHtml(release.tag)}"><b>${escapeHtml(release.tag)}</b><span>${escapeHtml(release.name)}</span><time>${escapeHtml(fmtDate(release.published_at))}</time></button>`).join(""):'<p>No public GitHub release records discovered in the current API window.</p>'}</div></section>
    <div class="dossier-footer"><p>Repository metadata and evidence are public GitHub signals. They do not establish production deployment, security quality or runtime health.</p><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">OPEN PUBLIC REPOSITORY ↗</a><button type="button" data-copy-project-link>COPY DOSSIER LINK</button></div>`;
    body?.querySelectorAll("[data-dossier-evidence]").forEach(button=>button.addEventListener("click",()=>{dialog.close();openEvidenceBySlug(button.dataset.dossierEvidence);}));
    body?.querySelectorAll("[data-dossier-release]").forEach(button=>button.addEventListener("click",()=>{const[name,tag]=button.dataset.dossierRelease.split("::"),index=state.releases.findIndex(r=>r.repo===name&&r.tag===tag);dialog.close();if(index>=0)openReleaseInspector(index);}));
    body?.querySelector("[data-copy-project-link]")?.addEventListener("click",async event=>{const url=new URL(location.href);url.searchParams.set("project",repo.name);url.searchParams.delete("evidence");url.searchParams.delete("release");try{await navigator.clipboard.writeText(url.toString());event.currentTarget.textContent="LINK COPIED ✓";}catch{}});
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("project",repo.name);setBrowserContext(repo.name,repo.description||BASE_DESCRIPTION);addTerminal("DOSSIER",`Opened public project dossier: ${repo.name}`);
  }

  function openReleaseInspector(index,{updateUrl=true}={}){
    const release=state.releases[index],dialog=$("release-inspector");if(!release||!dialog)return;
    const repo=state.repos.find(item=>item.name===release.repo),visuals=evidenceForRepo(release.repo),ev=repo?state.evidence.get(repo.name):null;
    $("release-inspector-title").textContent=`${release.repo} // ${release.tag}`;
    $("release-inspector-body").innerHTML=`<section class="dossier-hero"><div><span>${release.prerelease?"PUBLIC PREVIEW":"PUBLIC RELEASE"}</span><h3>${escapeHtml(release.name)}</h3><p>Published ${escapeHtml(fmtDate(release.published_at))}. This is a GitHub release record, not proof of production deployment.</p></div></section><section class="dossier-grid"><article><h4>RELEASE RECORD</h4><dl><div><dt>REPOSITORY</dt><dd>${escapeHtml(release.repo)}</dd></div><div><dt>TAG</dt><dd>${escapeHtml(release.tag)}</dd></div><div><dt>PUBLISHED</dt><dd>${escapeHtml(fmtDate(release.published_at))}</dd></div><div><dt>VISUAL EVIDENCE</dt><dd>${visuals.length} mapped items</dd></div></dl></article><article><h4>REPOSITORY EVIDENCE CONTEXT</h4><p>${ev?.error?"Public tree evidence is unknown due to an API error.":ev?`${[ev.readme,ev.security,ev.license,ev.architecture].filter(Boolean).length} artifact classes are discoverable in the current public tree scan.`:"Repository tree was not scanned in the current evidence window."}</p></article></section><div class="dossier-footer"><a href="${escapeHtml(release.url)}" target="_blank" rel="noreferrer">OPEN RELEASE ON GITHUB ↗</a>${repo?`<button type="button" data-release-project="${escapeHtml(repo.name)}">OPEN PROJECT DOSSIER</button>`:""}<button type="button" data-copy-release-link>COPY RELEASE LINK</button></div>`;
    $("release-inspector-body").querySelector("[data-release-project]")?.addEventListener("click",event=>{dialog.close();openProjectDossier(event.currentTarget.dataset.releaseProject);});
    $("release-inspector-body").querySelector("[data-copy-release-link]")?.addEventListener("click",async event=>{const key=`${release.repo}::${release.tag}`,url=new URL(location.href);url.searchParams.set("release",key);url.searchParams.delete("project");url.searchParams.delete("evidence");try{await navigator.clipboard.writeText(url.toString());event.currentTarget.textContent="LINK COPIED ✓";}catch{}});
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("release",`${release.repo}::${release.tag}`);setBrowserContext(`${release.repo} ${release.tag}`,`Public GitHub release record for ${release.repo} ${release.tag}. Not a production deployment claim.`);addTerminal("RELEASE",`Opened public release: ${release.repo} ${release.tag}`);
  }

  function setupDossierDialogs(){
    $("dossier-close")?.addEventListener("click",()=>{if($("project-dossier")?.open)$("project-dossier").close();clearDeepLink("project");resetBrowserContext();});
    $("release-inspector-close")?.addEventListener("click",()=>{if($("release-inspector")?.open)$("release-inspector").close();clearDeepLink("release");resetBrowserContext();});
  }

  function updateEvidenceCoverage(){
    const items=evidenceCatalog(),runtime=items.filter(item=>item.type==="runtime").length,source=items.filter(item=>item.type==="source").length,interfaceCount=runtime+source,share=interfaceCount?Math.round(runtime/interfaceCount*100):0,gaps=source+2;
    if($("coverage-percent")){$("coverage-percent").textContent=`${share}%`;$("coverage-percent").title="Share of current interface evidence represented by actual captures";}
    if($("coverage-runtime"))$("coverage-runtime").textContent=String(runtime);if($("coverage-source"))$("coverage-source").textContent=String(source);if($("coverage-gaps"))$("coverage-gaps").textContent=String(gaps);
    if($("show-capture-gaps")&&!$("show-capture-gaps").dataset.bound){$("show-capture-gaps").dataset.bound="1";$("show-capture-gaps").addEventListener("click",()=>{const search=$("visual-evidence-search");if(search)search.value="";document.querySelector('[data-evidence-filter="source"]')?.click();document.getElementById("inside-builds")?.scrollIntoView({behavior:"smooth"});addTerminal("EVIDENCE",`Showing ${source} source-derived screens awaiting runtime capture; Secure Chat and DPN Editor remain source gaps`);});}
  }

  function setupProductFamilies(){
    document.querySelectorAll("[data-family]").forEach(button=>button.addEventListener("click",()=>{state.activeFamily=button.dataset.family||"all";document.querySelectorAll("[data-family]").forEach(item=>item.classList.toggle("active",item===button));if($("family-state"))$("family-state").textContent=FAMILY_LABELS[state.activeFamily]||"DPN PRODUCTS";if(els.search)els.search.value="";renderProjects();document.getElementById("projects")?.scrollIntoView({behavior:"smooth",block:"start"});addTerminal("FAMILY",`Product constellation: ${FAMILY_LABELS[state.activeFamily]}`);}));
    $("family-reset")?.addEventListener("click",()=>{state.activeFamily="all";document.querySelectorAll("[data-family]").forEach(item=>item.classList.remove("active"));if($("family-state"))$("family-state").textContent=FAMILY_LABELS.all;renderProjects();});
  }

  function renderBuildLineage(){
    const board=$("lineage-board"),select=$("lineage-project");if(!board)return;
    if(select&&select.options.length<=1){[...state.repos].sort((a,b)=>a.name.localeCompare(b.name)).forEach(repo=>{const option=document.createElement("option");option.value=repo.name;option.textContent=repo.name;select.appendChild(option);});select.addEventListener("change",renderBuildLineage);}
    const selected=select?.value||"all",repos=selected==="all"?[...state.repos].sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,10):state.repos.filter(repo=>repo.name===selected);
    if($("lineage-state"))$("lineage-state").textContent=`${repos.length} PUBLIC PROJECT${repos.length===1?"":"S"} // PUSH + RELEASE + VISUAL EVIDENCE`;
    board.innerHTML=repos.map(repo=>{const releases=state.releases.filter(item=>item.repo===repo.name).slice(0,4),visuals=evidenceForRepo(repo.name);return `<article class="lineage-card"><header><div><span>${escapeHtml(FAMILY_LABELS[familyForRepo(repo.name)]||"DPN PRODUCT")}</span><h3>${escapeHtml(repo.name)}</h3></div><button type="button" data-lineage-project="${escapeHtml(repo.name)}">DOSSIER</button></header><div class="lineage-signal"><span class="lineage-dot push"></span><div><b>PUBLIC SOURCE PUSH</b><small>${escapeHtml(fmtDate(repo.pushed_at))} • ${escapeHtml(relativeAge(repo.pushed_at))}</small></div></div>${releases.map(release=>`<div class="lineage-signal"><span class="lineage-dot release"></span><div><b>${escapeHtml(release.prerelease?"PREVIEW":"RELEASE")} // ${escapeHtml(release.tag)}</b><small>${escapeHtml(fmtDate(release.published_at))} • ${escapeHtml(release.name)}</small></div></div>`).join("")}${visuals.length?`<div class="lineage-visuals">${visuals.slice(0,3).map(item=>`<button type="button" data-lineage-evidence="${escapeHtml(item.slug)}"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}"><span>${escapeHtml(item.type.toUpperCase())}</span></button>`).join("")}</div>`:'<p class="lineage-none">No mapped visual evidence in the Command Center.</p>'}</article>`;}).join("")||'<p class="feed-empty">No public lineage records available.</p>';
    board.querySelectorAll("[data-lineage-project]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.lineageProject)));board.querySelectorAll("[data-lineage-evidence]").forEach(button=>button.addEventListener("click",()=>openEvidenceBySlug(button.dataset.lineageEvidence)));
  }

  function renderCommandIndex(){
    if(!els.paletteResults)return;els.paletteResults.querySelectorAll(".dynamic-command").forEach(node=>node.remove());
    const repoButtons=state.repos.slice(0,20).map(repo=>`<button type="button" class="dynamic-command" data-project="${escapeHtml(repo.name)}"><span>PRJ</span><strong>${escapeHtml(repo.name)}</strong><small>Open public project dossier</small></button>`).join("");
    const evidenceButtons=evidenceCatalog().slice(0,30).map(item=>`<button type="button" class="dynamic-command" data-evidence="${escapeHtml(item.slug)}"><span>VIS</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type.toUpperCase())} visual evidence</small></button>`).join("");
    els.paletteResults.insertAdjacentHTML("beforeend",repoButtons+evidenceButtons+'<button type="button" class="dynamic-command" data-target="product-worlds"><span>CMD</span><strong>Open Product Worlds</strong><small>Enter the six cinematic DPN product subsystems</small></button><button type="button" class="dynamic-command" data-action="actual-captures"><span>CMD</span><strong>Show Actual Captures</strong><small>Filter the evidence museum to runtime/project output</small></button><button type="button" class="dynamic-command" data-action="capture-gaps"><span>CMD</span><strong>Show Capture Gaps</strong><small>Find source-derived screens awaiting runtime capture</small></button><button type="button" class="dynamic-command" data-target="verification-board"><span>CMD</span><strong>Open Product Verification Board</strong><small>Inspect proof state product by product</small></button><button type="button" class="dynamic-command" data-target="capture-factory"><span>CMD</span><strong>Open Capture Operations</strong><small>Launch manual runtime evidence factories</small></button><button type="button" class="dynamic-command" data-target="runtime-evidence-intake"><span>CMD</span><strong>Open Runtime Evidence Intake</strong><small>Inspect validated repo-hosted runtime captures</small></button>');
  }

  function setupVisualMode(){
    const button=$("visual-mode-toggle");if(!button)return;const modes=["full","balanced","low"],saved=localStorage.getItem("dpn-command-visual-mode");state.visualMode=modes.includes(saved)?saved:(window.matchMedia("(prefers-reduced-motion: reduce)").matches?"low":"full");
    const apply=()=>{document.documentElement.dataset.visualMode=state.visualMode;button.textContent=state.visualMode==="full"?"FX // FULL":state.visualMode==="balanced"?"FX // BALANCED":"FX // LOW";localStorage.setItem("dpn-command-visual-mode",state.visualMode);};apply();
    button.addEventListener("click",()=>{state.visualMode=modes[(modes.indexOf(state.visualMode)+1)%modes.length];apply();addTerminal("VISUAL",`Performance mode: ${state.visualMode.toUpperCase()}`);});
  }

  function setupPwa(){
    if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
    const install=$("install-app");let deferred=null;window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferred=event;if(install)install.hidden=false;});
    install?.addEventListener("click",async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;install.hidden=true;});
  }

  function applyDeepLinksAfterTelemetry(){
    const params=new URL(location.href).searchParams,project=params.get("project"),releaseKey=params.get("release");
    if(project&&!state.deepLinkHandled.has("project")){state.deepLinkHandled.add("project");openProjectDossier(project,{updateUrl:false});}
    else if(releaseKey&&!state.deepLinkHandled.has("release")){const[repoName,tag]=releaseKey.split("::"),index=state.releases.findIndex(item=>item.repo===repoName&&item.tag===tag);if(index>=0){state.deepLinkHandled.add("release");openReleaseInspector(index,{updateUrl:false});}}
    const mesh=params.get("mesh");
    if(mesh&&!state.deepLinkHandled.has("mesh")){const node=els.topology?.querySelector(`[data-node="${CSS.escape(mesh)}"]`);if(node){state.deepLinkHandled.add("mesh");node.dispatchEvent(new MouseEvent("click",{bubbles:true}));}}
  }


  function setupShareView() {
    const button=$("share-view");
    if(!button)return;
    button.addEventListener("click",async()=>{
      const payload={title:document.title,text:"DPN Technology public engineering command center",url:location.href};
      try{
        if(navigator.share){await navigator.share(payload);return;}
        await navigator.clipboard.writeText(location.href);
        button.textContent="LINK COPIED ✓";
        setTimeout(()=>button.textContent="SHARE VIEW",1400);
      }catch{}
    });
  }

  function setupNetworkState() {
    const chip=$("connection-state"),banner=$("offline-banner");
    const update=()=>{
      const online=navigator.onLine;
      if(chip){chip.textContent=online?"NETWORK // ONLINE":"NETWORK // OFFLINE";chip.classList.toggle("offline",!online);}
      if(banner)banner.hidden=online;
      document.documentElement.classList.toggle("offline",!online);
      addTerminal("NETWORK",online?"Browser network online":"Browser offline — static content only");
    };
    window.addEventListener("online",update);
    window.addEventListener("offline",update);
    update();
  }

  function setupPresentationMode() {
    const toggle=$("presentation-toggle"),dock=$("presentation-dock"),title=$("presentation-step-title"),progress=$("presentation-progress");
    if(!toggle||!dock)return;
    const applyStep=()=>{
      const [id,label]=PRESENTATION_STEPS[state.presentationStep]||PRESENTATION_STEPS[0];
      if(title)title.textContent=label.toUpperCase();
      if(progress)progress.textContent=`${state.presentationStep+1} / ${PRESENTATION_STEPS.length}`;
      document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
      history.replaceState(history.state,"",`#${id}`);
      addTerminal("PRESENT",`Presentation step ${state.presentationStep+1}: ${label}`);
    };
    const enter=()=>{
      if(state.presentationActive)return;
      state.presentationActive=true;
      state.presentationPriorVisualMode=state.visualMode;
      document.documentElement.classList.add("presentation-mode");
      dock.setAttribute("aria-hidden","false");
      toggle.setAttribute("aria-pressed","true");
      toggle.textContent="PRESENT // ON";
      state.presentationStep=Math.max(0,PRESENTATION_STEPS.findIndex(([id])=>location.hash===`#${id}`));
      if(state.presentationStep<0)state.presentationStep=0;
      state.visualMode="balanced";
      document.documentElement.dataset.visualMode="balanced";
      $("visual-mode-toggle").textContent="FX // BALANCED";
      applyStep();
    };
    const exit=()=>{
      if(!state.presentationActive)return;
      state.presentationActive=false;
      document.documentElement.classList.remove("presentation-mode");
      dock.setAttribute("aria-hidden","true");
      toggle.setAttribute("aria-pressed","false");
      toggle.textContent="PRESENT // OFF";
      state.visualMode=state.presentationPriorVisualMode||"full";
      document.documentElement.dataset.visualMode=state.visualMode;
      $("visual-mode-toggle").textContent=state.visualMode==="full"?"FX // FULL":state.visualMode==="balanced"?"FX // BALANCED":"FX // LOW";
      addTerminal("PRESENT","Presentation mode exited");
    };
    toggle.addEventListener("click",()=>state.presentationActive?exit():enter());
    $("presentation-exit")?.addEventListener("click",exit);
    $("presentation-next")?.addEventListener("click",()=>{state.presentationStep=(state.presentationStep+1)%PRESENTATION_STEPS.length;applyStep();});
    $("presentation-prev")?.addEventListener("click",()=>{state.presentationStep=(state.presentationStep-1+PRESENTATION_STEPS.length)%PRESENTATION_STEPS.length;applyStep();});
    window.addEventListener("keydown",event=>{
      if(!state.presentationActive)return;
      if(event.key==="PageDown"){event.preventDefault();$("presentation-next")?.click();}
      if(event.key==="PageUp"){event.preventDefault();$("presentation-prev")?.click();}
      if(event.key==="Escape"){exit();}
    });
  }


  function nextProofForRepo(repo,visuals,releases,evidence,run) {
    const runtime=visuals.filter(item=>item.type==="runtime").length;
    const source=visuals.filter(item=>item.type==="source").length;
    const runState=captureRunState(run);
    if(!visuals.length && !evidence?.captureFactory)return "INSTALL CAPTURE FACTORY + ADD VERIFIED VISUAL";
    if(!runtime && evidence?.captureFactory && runState.key==="failure")return "FIX LATEST CAPTURE RUN + RE-RUN";
    if(!runtime && evidence?.captureFactory && runState.key==="active")return "CAPTURE RUN IN PROGRESS — VERIFY RESULT WHEN COMPLETE";
    if(!runtime && evidence?.captureFactory && runState.key==="success" && !evidence?.runtimeManifest)return "COMMIT VALID RUNTIME MANIFEST + CAPTURE ARTIFACTS";
    if(!visuals.length && evidence?.captureFactory && !evidence?.runtimeManifest)return "RUN MANUAL CAPTURE WORKFLOW";
    if(!runtime && !evidence?.captureFactory)return "INSTALL CAPTURE FACTORY + CAPTURE RUNTIME UI";
    if(!runtime && evidence?.captureFactory && !evidence?.runtimeManifest)return "RUN MANUAL CAPTURE WORKFLOW";
    if(!runtime)return "PROMOTE COMMITTED RUNTIME CAPTURE INTO COMMAND CENTER";
    if(source>0)return "REPLACE REMAINING SOURCE-DERIVED VIEWS";
    if(!releases.length)return "ADD PUBLIC RELEASE ARTIFACT";
    if(!evidence || evidence.error)return "RETRY PUBLIC REPOSITORY EVIDENCE SCAN";
    return "EXPAND ACTUAL SCREEN COVERAGE";
  }

  function renderVerificationBoard() {
    const grid=$("verification-grid");
    if(!grid)return;
    const query=String($("verification-search")?.value||"").trim().toLowerCase();
    const filter=$("verification-filter")?.value||"all";
    const releaseSet=releaseRepoSet();

    const records=state.repos.map(repo=>{
      const visuals=evidenceForRepo(repo.name);
      const ingested=runtimeEvidenceForRepo(repo.name);
      const runtime=visuals.filter(item=>item.type==="runtime").length + ingested.length;
      const source=visuals.filter(item=>item.type==="source").length;
      const artwork=visuals.filter(item=>item.type==="artwork").length;
      const provenance=visuals.filter(item=>item.provenance?.files?.length).length;
      const releases=state.releases.filter(item=>item.repo===repo.name);
      const evidence=state.evidence.get(repo.name);
      const run=state.captureRuns.get(repo.name)||null;
      const proofState=runtime>0?"runtime":source>0?"source-only":"none";
      return {repo,visuals,ingested,runtime,source,artwork,provenance,releases,evidence,run,proofState};
    });

    const productsWithVisuals=records.filter(r=>r.visuals.length>0||r.ingested.length>0).length;
    const productsRuntime=records.filter(r=>r.runtime>0).length;
    const productsSourceOnly=records.filter(r=>r.runtime===0&&r.source>0).length;
    const productsProvenance=records.filter(r=>r.provenance>0).length;
    const productsRelease=records.filter(r=>r.releases.length>0).length;
    if($("verify-products-visual"))$("verify-products-visual").textContent=String(productsWithVisuals);
    if($("verify-products-runtime"))$("verify-products-runtime").textContent=String(productsRuntime);
    if($("verify-products-source-only"))$("verify-products-source-only").textContent=String(productsSourceOnly);
    if($("verify-products-provenance"))$("verify-products-provenance").textContent=String(productsProvenance);
    if($("verify-products-release"))$("verify-products-release").textContent=String(productsRelease);

    const filtered=records.filter(record=>{
      const hay=[record.repo.name,record.repo.description,record.repo.language,FAMILY_LABELS[familyForRepo(record.repo.name)]].filter(Boolean).join(" ").toLowerCase();
      const queryMatch=!query||hay.includes(query);
      const filterMatch=filter==="all"||
        (filter==="runtime"&&record.runtime>0)||
        (filter==="source-only"&&record.runtime===0&&record.source>0)||
        (filter==="visual"&&(record.visuals.length>0||record.ingested.length>0))||
        (filter==="none"&&record.visuals.length===0&&record.ingested.length===0);
      return queryMatch&&filterMatch;
    }).sort((a,b)=>{
      const aVisual=a.visuals.length>0?0:1,bVisual=b.visuals.length>0?0:1;
      if(aVisual!==bVisual)return aVisual-bVisual;
      return a.repo.name.localeCompare(b.repo.name);
    });

    if($("verification-state"))$("verification-state").textContent=`${filtered.length} / ${records.length} PUBLIC PRODUCTS SHOWN`;
    if(!filtered.length){
      grid.innerHTML='<article class="verification-loading">No public products match the current verification filter.</article>';
      return;
    }

    grid.innerHTML=filtered.map(record=>{
      const ev=record.evidence;
      const artifactCount=ev&&!ev.error?[ev.readme,ev.security,ev.license,ev.architecture].filter(Boolean).length:null;
      const stateLabel=record.runtime>0?"ACTUAL CAPTURE PRESENT":record.source>0?"SOURCE VISUAL ONLY":"NO MAPPED VISUAL";
      const stateClass=record.runtime>0?"runtime":record.source>0?"source":"none";
      const combinedVisuals=record.visuals.concat(record.ingested.map(item=>({type:"runtime",title:item.label})));
      const nextProof=nextProofForRepo(record.repo,combinedVisuals,record.releases,ev,record.run);
      const runState=captureRunState(record.run);
      return `
      <article class="verification-card ${stateClass}">
        <header>
          <div><span>${escapeHtml(FAMILY_LABELS[familyForRepo(record.repo.name)]||"DPN PRODUCT")}</span><h3>${escapeHtml(record.repo.name)}</h3></div>
          <b class="verification-state-badge">${stateLabel}</b>
        </header>
        <p>${escapeHtml(record.repo.description||"Public DPN Technology source repository.")}</p>
        <div class="verification-metrics">
          <span><b>${record.runtime}</b><small>ACTUAL</small></span>
          <span><b>${record.ingested.length}</b><small>AUTO-INGESTED</small></span>
          <span><b>${record.source}</b><small>SOURCE-DERIVED</small></span>
          <span><b>${record.provenance}</b><small>EXACT PROVENANCE</small></span>
          <span><b>${record.releases.length}</b><small>RELEASES</small></span>
          <span><b>${escapeHtml(runState.short)}</b><small>LATEST CAPTURE RUN</small></span>
        </div>
        <div class="verification-artifacts">
          <span class="${ev?.readme?"present":ev?.error?"unknown":"missing"}">README</span>
          <span class="${ev?.security?"present":ev?.error?"unknown":"missing"}">SECURITY</span>
          <span class="${ev?.license?"present":ev?.error?"unknown":"missing"}">LICENSE</span>
          <span class="${ev?.architecture?"present":ev?.error?"unknown":"missing"}">ARCH</span>
          <span class="${releaseSet.has(record.repo.name)?"present":"missing"}">RELEASE</span>
          <span class="${ev?.captureFactory?"present":ev?.error?"unknown":"missing"}">CAPTURE FACTORY</span>
          <span class="capture-run-chip run-${escapeHtml(runState.key)}">${escapeHtml(runState.label)}</span>
        </div>
        <div class="verification-next"><span>NEXT PUBLIC PROOF</span><b>${escapeHtml(nextProof)}</b></div>
        <div class="verification-card-foot">
          <span>PUBLIC PUSH // ${escapeHtml(fmtDate(record.repo.pushed_at))}</span>
          <span>REPO EVIDENCE // ${artifactCount===null?"UNKNOWN":artifactCount+"/4"}</span>
          <button type="button" data-verify-dossier="${escapeHtml(record.repo.name)}">INSPECT DOSSIER</button>
          ${record.visuals[0]?`<button type="button" data-verify-evidence="${escapeHtml(record.visuals[0].slug)}">OPEN VISUAL</button>`:""}
          ${record.ingested[0]?`<a href="${escapeHtml(record.ingested[0].sourceUrl)}" target="_blank" rel="noreferrer">OPEN RUNTIME ↗</a>`:""}
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll("[data-verify-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.verifyDossier)));
    grid.querySelectorAll("[data-verify-evidence]").forEach(button=>button.addEventListener("click",()=>openEvidenceBySlug(button.dataset.verifyEvidence)));
  }


  const CAPTURE_RUN_CACHE_KEY = "dpn-command-center-capture-runs-v4.2";
  const CAPTURE_RUN_CACHE_TTL = 5 * 60 * 1000;

  function captureWorkflowName(evidence) {
    return String(evidence?.paths?.captureWorkflow || "").split("/").pop() || "ui-evidence-capture.yml";
  }

  function readCaptureRunCache(repoName) {
    try {
      const cache=JSON.parse(localStorage.getItem(CAPTURE_RUN_CACHE_KEY)||"{}");
      const entry=cache[repoName];
      if(!entry || Date.now()-entry.savedAt>CAPTURE_RUN_CACHE_TTL)return null;
      return entry.value || null;
    } catch {
      return null;
    }
  }

  function writeCaptureRunCache(repoName,value) {
    try {
      const cache=JSON.parse(localStorage.getItem(CAPTURE_RUN_CACHE_KEY)||"{}");
      cache[repoName]={savedAt:Date.now(),value};
      localStorage.setItem(CAPTURE_RUN_CACHE_KEY,JSON.stringify(cache));
    } catch {
      // Run intelligence still works when browser storage is unavailable.
    }
  }

  function normalizeCaptureRun(run) {
    if(!run)return {none:true};
    return {
      status:String(run.status||"unknown"),
      conclusion:run.conclusion ? String(run.conclusion) : "",
      url:String(run.html_url||""),
      runNumber:Number(run.run_number)||0,
      createdAt:String(run.created_at||""),
      updatedAt:String(run.updated_at||""),
      headSha:String(run.head_sha||""),
      event:String(run.event||"")
    };
  }

  function captureRunState(entry) {
    if(!entry)return state.captureRunsScanned
      ? {key:"unknown",label:"RUN STATUS UNKNOWN",short:"UNKNOWN"}
      : {key:"unchecked",label:"RUN HISTORY NOT CHECKED",short:"NOT CHECKED"};
    if(entry.error)return {key:"unknown",label:"RUN STATUS UNKNOWN",short:"UNKNOWN"};
    if(entry.none)return {key:"none",label:"NO MANUAL RUN DISCOVERED",short:"NO RUN"};
    if(entry.status && entry.status!=="completed"){
      return {key:"active",label:`RUN ${String(entry.status).replaceAll("_"," ").toUpperCase()}`,short:String(entry.status).replaceAll("_"," ").toUpperCase()};
    }
    if(entry.conclusion==="success")return {key:"success",label:"LATEST RUN SUCCEEDED",short:"SUCCESS"};
    if(["failure","timed_out","startup_failure","action_required","stale"].includes(entry.conclusion)){
      return {key:"failure",label:`LATEST RUN ${String(entry.conclusion).replaceAll("_"," ").toUpperCase()}`,short:"FAILED"};
    }
    if(entry.conclusion)return {key:"neutral",label:`LATEST RUN ${String(entry.conclusion).replaceAll("_"," ").toUpperCase()}`,short:String(entry.conclusion).replaceAll("_"," ").toUpperCase()};
    return {key:"unknown",label:"RUN STATUS UNKNOWN",short:"UNKNOWN"};
  }

  function renderCaptureRunSummary(records) {
    const installed=records.filter(item=>item.installed);
    const set=(id,value)=>{const el=$(id);if(el)el.textContent=String(value);};
    const status=$("capture-run-scan-state");
    const button=$("scan-capture-runs");

    if(!state.captureRunsScanned){
      ["capture-run-success","capture-run-failed","capture-run-active","capture-run-none","capture-run-unknown"].forEach(id=>set(id,"—"));
      if(status)status.textContent="ON DEMAND // NOT CHECKED";
      if(button){button.disabled=false;button.textContent="CHECK LATEST CAPTURE RUNS";}
      return;
    }

    const states=installed.map(item=>captureRunState(state.captureRuns.get(item.repo.name)));
    set("capture-run-success",states.filter(item=>item.key==="success").length);
    set("capture-run-failed",states.filter(item=>item.key==="failure").length);
    set("capture-run-active",states.filter(item=>item.key==="active").length);
    set("capture-run-none",states.filter(item=>item.key==="none").length);
    set("capture-run-unknown",states.filter(item=>["unknown","neutral"].includes(item.key)).length);
    if(status)status.textContent=`CHECKED // ${installed.length} FACTOR${installed.length===1?"Y":"IES"} // ${state.captureRunErrors} API ERROR${state.captureRunErrors===1?"":"S"}`;
    if(button){button.disabled=false;button.textContent="REFRESH LATEST CAPTURE RUNS";}
  }

  async function scanCaptureRuns() {
    const button=$("scan-capture-runs");
    const status=$("capture-run-scan-state");
    if(button){button.disabled=true;button.textContent="CHECKING RUNS…";}
    if(status)status.textContent="SCANNING PUBLIC WORKFLOW HISTORY";
    state.captureRunErrors=0;

    const candidates=state.repos.filter(repo=>{
      const evidence=state.evidence.get(repo.name);
      return Boolean(evidence && !evidence.error && evidence.captureFactory);
    }).slice(0,16);

    let checked=0;
    for(let offset=0;offset<candidates.length;offset+=4){
      const batch=candidates.slice(offset,offset+4);
      const results=await Promise.all(batch.map(async repo=>{
        const cached=readCaptureRunCache(repo.name);
        if(cached)return [repo.name,cached];
        const evidence=state.evidence.get(repo.name);
        const workflowName=captureWorkflowName(evidence);
        try{
          const payload=await api(`/repos/${ORG}/${encodeURIComponent(repo.name)}/actions/workflows/${encodeURIComponent(workflowName)}/runs?event=workflow_dispatch&per_page=1`);
          const entry=normalizeCaptureRun(payload?.workflow_runs?.[0]||null);
          writeCaptureRunCache(repo.name,entry);
          return [repo.name,entry];
        }catch(error){
          state.captureRunErrors++;
          return [repo.name,{error:true,message:String(error?.message||"workflow run unavailable")}];
        }
      }));
      results.forEach(([name,entry])=>state.captureRuns.set(name,entry));
      checked+=results.length;
      if(status)status.textContent=`SCANNING // ${checked} / ${candidates.length} FACTORIES`;
    }

    state.captureRunsScanned=true;
    addTerminal("CAPTURE",`Run intelligence checked ${candidates.length} public capture factories; ${state.captureRunErrors} API error(s)`);
    renderCaptureFactory();
    renderVerificationBoard();
  }

  function captureWorkflowUrl(repoName) {
    return `https://github.com/${ORG}/${encodeURIComponent(repoName)}/actions/workflows/ui-evidence-capture.yml`;
  }

  function captureExecutionState(repoName,evidence) {
    if(evidence?.error)return {key:"unknown",label:"PUBLIC TREE UNKNOWN"};
    if(evidence?.runtimeManifest)return {key:"manifest",label:"RUNTIME MANIFEST PRESENT"};
    if(!evidence?.captureFactory)return {key:"missing",label:"NOT AUTOMATED"};
    if(repoName==="DPN-Tool-Die-Simulator")return {key:"blocked",label:"SELF-HOSTED RUNNER REQUIRED"};
    return {key:"ready",label:"READY TO RUN"};
  }

  function captureRunnerLabel(repoName) {
    const nativeX11=new Set(["DPN-OS","DPN-Death-the-Developer","DPN-War-Simulator"]);
    if(repoName==="DPN-Tool-Die-Simulator")return "SELF-HOSTED WINDOWS · UNREAL 5.8";
    if(repoName==="DPN-Aqua-Labs-Point-of-Sale-System")return "GITHUB LINUX · XVFB / PYSIDE6";
    if(nativeX11.has(repoName))return "GITHUB LINUX · XVFB NATIVE";
    return "GITHUB LINUX · PLAYWRIGHT";
  }

  function renderCaptureFactory() {
    const grid=$("capture-factory-grid");
    if(!grid)return;

    const records=state.repos.map(repo=>{
      const evidence=state.evidence.get(repo.name);
      const visuals=evidenceForRepo(repo.name);
      const actual=visuals.filter(item=>item.type==="runtime").length + runtimeEvidenceForRepo(repo.name).length;
      return {
        repo,
        evidence,
        actual,
        installed:Boolean(evidence && !evidence.error && evidence.captureFactory),
        manifest:Boolean(evidence && !evidence.error && evidence.runtimeManifest),
        run:state.captureRuns.get(repo.name)||null
      };
    }).sort((a,b)=>Number(b.installed)-Number(a.installed)||Number(b.manifest)-Number(a.manifest)||Number(b.actual>0)-Number(a.actual>0)||a.repo.name.localeCompare(b.repo.name));

    const installed=records.filter(item=>item.installed).length;
    const manifests=records.filter(item=>item.manifest).length;
    const runtimeProducts=records.filter(item=>item.actual>0).length;
    const ready=records.filter(item=>captureExecutionState(item.repo.name,item.evidence).key==="ready").length;
    const selfHosted=records.filter(item=>captureExecutionState(item.repo.name,item.evidence).key==="blocked").length;
    const notInstalled=records.filter(item=>!item.installed).length;
    if($("capture-installed"))$("capture-installed").textContent=String(installed);
    if($("capture-ready"))$("capture-ready").textContent=String(ready);
    if($("capture-manifests"))$("capture-manifests").textContent=String(manifests);
    if($("capture-runtime-products"))$("capture-runtime-products").textContent=String(runtimeProducts);
    if($("capture-self-hosted"))$("capture-self-hosted").textContent=String(selfHosted);
    if($("capture-not-installed"))$("capture-not-installed").textContent=String(notInstalled);
    renderCaptureRunSummary(records);

    grid.innerHTML=records.map(item=>{
      const ev=item.evidence;
      const runner=captureRunnerLabel(item.repo.name);
      const execution=captureExecutionState(item.repo.name,ev);
      const runState=captureRunState(item.run);
      const status=execution.label;
      const stateBase=execution.key==="manifest"?"manifest":execution.key==="ready"?"installed":execution.key==="blocked"?"installed":execution.key==="unknown"?"unknown":item.actual>0?"runtime":"missing";
      const stateClass=stateBase+(runner.startsWith("SELF-HOSTED")?" self-hosted":"")+(execution.key==="ready"?" ready-to-run":"")+` run-${runState.key}`;
      const workflow=ev?.paths?.captureWorkflow?artifactUrl(item.repo,ev.paths.captureWorkflow):"";
      const harness=ev?.paths?.captureTool?artifactUrl(item.repo,ev.paths.captureTool):"";
      const manifest=ev?.paths?.runtimeManifest?artifactUrl(item.repo,ev.paths.runtimeManifest):"";
      const actionUrl=item.installed?captureWorkflowUrl(item.repo.name):"";
      const runMeta=item.run && !item.run.error && !item.run.none
        ? [item.run.runNumber?`RUN #${item.run.runNumber}`:"",item.run.updatedAt?fmtDate(item.run.updatedAt):"",item.run.headSha?item.run.headSha.slice(0,7):""].filter(Boolean).join(" · ")
        : runState.key==="unchecked" ? "Use the on-demand run scan to inspect public workflow history." : runState.key==="none" ? "No workflow_dispatch run was returned by the public API." : item.run?.message || "Latest public workflow state unavailable.";
      return `<article class="capture-factory-card ${stateClass}">
        <header><div><span>${escapeHtml(FAMILY_LABELS[familyForRepo(item.repo.name)]||"DPN PRODUCT")}</span><h3>${escapeHtml(item.repo.name)}</h3></div><b>${escapeHtml(status)}</b></header>
        <div class="capture-factory-metrics">
          <span><b>${item.installed?"YES":"NO"}</b><small>FACTORY</small></span>
          <span><b>${item.manifest?"YES":"NO"}</b><small>MANIFEST</small></span>
          <span><b>${item.actual}</b><small>ACTUAL VISUALS</small></span>
          <span><b>${escapeHtml(runState.short)}</b><small>LATEST RUN</small></span>
        </div>
        <div class="capture-run-intel ${escapeHtml(runState.key)}">
          <div><span>PUBLIC WORKFLOW RUN</span><b>${escapeHtml(runState.label)}</b><small>${escapeHtml(runMeta)}</small></div>
          ${item.run?.url?`<a href="${escapeHtml(item.run.url)}" target="_blank" rel="noreferrer">OPEN RUN ↗</a>`:""}
        </div>
        <div class="capture-factory-paths">
          ${workflow?`<a href="${escapeHtml(workflow)}" target="_blank" rel="noreferrer">WORKFLOW <span>${escapeHtml(ev.paths.captureWorkflow)}</span> ↗</a>`:""}
          ${harness?`<a href="${escapeHtml(harness)}" target="_blank" rel="noreferrer">HARNESS <span>${escapeHtml(ev.paths.captureTool)}</span> ↗</a>`:""}
          ${manifest?`<a href="${escapeHtml(manifest)}" target="_blank" rel="noreferrer">MANIFEST <span>${escapeHtml(ev.paths.runtimeManifest)}</span> ↗</a>`:""}
        </div>
        <footer><span>MANUAL DISPATCH · ${escapeHtml(runner)}</span>${actionUrl?`<a class="capture-run-link" href="${escapeHtml(actionUrl)}" target="_blank" rel="noreferrer">RUN FACTORY ↗</a>`:""}<button type="button" data-capture-dossier="${escapeHtml(item.repo.name)}">OPEN DOSSIER</button></footer>
      </article>`;
    }).join("") || '<article class="capture-factory-loading">Public capture-factory state unavailable.</article>';

    grid.querySelectorAll("[data-capture-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.captureDossier)));
  }


  function updateVisualOverdrive() {
    const latest=[...state.repos].sort((a,b)=>new Date(b.pushed_at||0)-new Date(a.pushed_at||0))[0];
    const visuals=evidenceCatalog();
    const set=(id,value)=>{const el=$(id);if(el)el.textContent=String(value);};
    set("hero-repo-count",state.repos.length||0);
    set("hero-release-count",state.releases.length||0);
    set("hero-visual-count",visuals.length||0);
    set("hero-public-state",state.repos.length?"ONLINE":"STATIC");
    set("overdrive-repos",state.repos.length||0);
    set("overdrive-releases",state.releases.length||0);
    set("overdrive-visuals",visuals.length||0);
    set("overdrive-push",latest?relativeAge(latest.pushed_at):"—");
    set("overdrive-push-repo",latest?.name||"No public repository signal");
    const signal=$("overdrive-signal"),sync=$("overdrive-sync");
    if(signal)signal.textContent=state.repos.length?"PUBLIC TELEMETRY ONLINE":"STATIC PRESENTATION";
    if(sync)sync.textContent=state.lastFetch?`Last sync ${fmtTime(state.lastFetch)}`:"GitHub public telemetry";
    const feed=$("overdrive-activity-feed");
    if(feed){
      const recent=[...state.repos].sort((a,b)=>new Date(b.pushed_at||0)-new Date(a.pushed_at||0)).slice(0,6);
      feed.innerHTML=recent.length?recent.map((repo,index)=>`
        <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
          <span>${String(index+1).padStart(2,"0")}</span>
          <div><b>${escapeHtml(repo.name)}</b><small>${escapeHtml(repo.description||"Public DPN Technology repository")}</small></div>
          <time>${escapeHtml(relativeAge(repo.pushed_at))}</time>
        </a>`).join(""):'<p>Public repository activity unavailable.</p>';
    }
  }

  function setupVisualOverdrive() {
    const progress=$("scroll-progress");
    const updateProgress=()=>{
      if(!progress)return;
      const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      progress.style.transform=`scaleX(${Math.min(1,Math.max(0,window.scrollY/max))})`;
    };
    updateProgress();
    window.addEventListener("scroll",updateProgress,{passive:true});

    const pointerSurface=document.querySelector("[data-overdrive-stage]");
    pointerSurface?.addEventListener("pointermove",event=>{
      const rect=pointerSurface.getBoundingClientRect();
      pointerSurface.style.setProperty("--pointer-x",`${((event.clientX-rect.left)/rect.width)*100}%`);
      pointerSurface.style.setProperty("--pointer-y",`${((event.clientY-rect.top)/rect.height)*100}%`);
    });

    document.querySelectorAll("[data-tilt]").forEach(card=>{
      card.addEventListener("pointermove",event=>{
        if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
        const rect=card.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        card.style.setProperty("--tilt-x",`${(-y*7).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y",`${(x*9).toFixed(2)}deg`);
        card.style.setProperty("--glow-x",`${((x+.5)*100).toFixed(1)}%`);
        card.style.setProperty("--glow-y",`${((y+.5)*100).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave",()=>{
        card.style.setProperty("--tilt-x","0deg");
        card.style.setProperty("--tilt-y","0deg");
      });
    });

    const observer="IntersectionObserver"in window?new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("revealed");observer.unobserve(entry.target);}});
    },{threshold:.12}):null;
    document.querySelectorAll(".reveal").forEach(node=>observer?observer.observe(node):node.classList.add("revealed"));
  }


  function updateProductWorldStats() {
    document.querySelectorAll(".product-world[data-repo]").forEach(world=>{
      const repoName=world.dataset.repo;
      const repo=state.repos.find(item=>item.name===repoName);
      const releases=state.releases.filter(item=>item.repo===repoName);
      const visuals=evidenceForRepo(repoName);
      const runtime=runtimeEvidenceForRepo(repoName);
      const values={
        push:repo?.pushed_at?relativeAge(repo.pushed_at):"—",
        releases:String(releases.length),
        visuals:String(visuals.length+runtime.length),
        language:repo?.language||"—"
      };
      world.querySelectorAll("[data-world-stat]").forEach(node=>{
        node.textContent=values[node.dataset.worldStat]??"—";
      });
      world.classList.toggle("repo-signal-online",Boolean(repo));
    });
  }


  let routeTimer=0;
  const focusState={repo:"",visuals:[],index:0};

  function routeToSection(id,label="",block="center") {
    const target=document.getElementById(id);
    if(!target)return;
    const overlay=$("route-transition"),routeLabel=$("route-transition-label"),routeTarget=$("route-transition-target");
    window.clearTimeout(routeTimer);
    if(routeLabel)routeLabel.textContent="ROUTING";
    if(routeTarget)routeTarget.textContent=label||id.replaceAll("-"," ").toUpperCase();
    if(overlay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      overlay.classList.add("active"); overlay.setAttribute("aria-hidden","false");
      routeTimer=window.setTimeout(()=>{
        target.scrollIntoView({behavior:"smooth",block});
        overlay.classList.add("departing");
        routeTimer=window.setTimeout(()=>{overlay.classList.remove("active","departing");overlay.setAttribute("aria-hidden","true");},430);
      },190);
    }else target.scrollIntoView({behavior:"smooth",block});
    addTerminal("ROUTE",`Command Bridge → ${label||id}`);
  }

  function updateCommandBridge() {
    if($("bridge-repos"))$("bridge-repos").textContent=String(state.repos.length||0);
    if($("bridge-visuals"))$("bridge-visuals").textContent=String(evidenceCatalog().length+state.runtimeEvidence.length);
    if($("bridge-signal"))$("bridge-signal").textContent=state.repos.length?"PUBLIC SIGNAL // ONLINE":"PUBLIC SIGNAL // STATIC";
  }

  function setupCommandBridge() {
    const bridge=$("command-bridge"),collapse=$("bridge-collapse"),activeLabel=$("bridge-active-label");
    collapse?.addEventListener("click",()=>{
      const collapsed=bridge?.classList.toggle("collapsed");
      collapse.textContent=collapsed?"+":"−";
      collapse.setAttribute("aria-label",collapsed?"Expand Command Bridge":"Collapse Command Bridge");
    });
    document.querySelectorAll("[data-bridge-target]").forEach(button=>button.addEventListener("click",()=>routeToSection(button.dataset.bridgeTarget,button.dataset.bridgeLabel||button.textContent.trim(),button.dataset.bridgeTarget==="top"?"start":"center")));
    document.querySelectorAll("[data-route-link]").forEach(link=>link.addEventListener("click",event=>{event.preventDefault();routeToSection(link.dataset.routeLink,link.dataset.routeLabel||"DPN SYSTEM","start");}));
    const observed=[...document.querySelectorAll("#top,.product-world,#founder-command,#inside-builds")];
    if("IntersectionObserver"in window){
      const observer=new IntersectionObserver(entries=>{
        const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(!visible)return;
        const id=visible.target.id,matching=document.querySelector(`[data-bridge-target="${CSS.escape(id)}"]`);
        document.querySelectorAll("[data-bridge-target]").forEach(button=>button.classList.toggle("active",button===matching));
        if(activeLabel)activeLabel.textContent=matching?.dataset.bridgeLabel||visible.target.dataset.worldName||id.replaceAll("-"," ").toUpperCase();
      },{threshold:[.25,.45,.65],rootMargin:"-15% 0px -20% 0px"});
      observed.forEach(node=>observer.observe(node));
    }
    updateCommandBridge();
  }

  function setupProductWorlds() {
    const worlds=[...document.querySelectorAll(".product-world[data-world-name]")];
    const railButtons=[...document.querySelectorAll("[data-world-target]")];
    const stateLabel=$("product-world-state");
    railButtons.forEach(button=>button.addEventListener("click",()=>routeToSection(button.dataset.worldTarget,button.textContent.trim(),"center")));
    document.querySelectorAll("[data-world-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.worldDossier)));
    document.querySelectorAll("[data-world-tilt]").forEach(frame=>{
      frame.addEventListener("pointermove",event=>{
        if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
        const rect=frame.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
        frame.style.setProperty("--world-rx",`${(-y*5).toFixed(2)}deg`);frame.style.setProperty("--world-ry",`${(x*7).toFixed(2)}deg`);
        frame.style.setProperty("--world-gx",`${((x+.5)*100).toFixed(1)}%`);frame.style.setProperty("--world-gy",`${((y+.5)*100).toFixed(1)}%`);
      });
      frame.addEventListener("pointerleave",()=>{frame.style.setProperty("--world-rx","0deg");frame.style.setProperty("--world-ry","0deg");});
    });
    if("IntersectionObserver"in window){
      const observer=new IntersectionObserver(entries=>{
        const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if(!visible)return;
        const active=visible.target;
        railButtons.forEach(button=>button.classList.toggle("active",button.dataset.worldTarget===active.id));
        worlds.forEach(world=>world.classList.toggle("world-active",world===active));
        if(stateLabel)stateLabel.textContent=active.dataset.worldName||"DPN PRODUCT";
      },{threshold:[.3,.45,.6]});
      worlds.forEach(world=>observer.observe(world));
    }
  }


  const PRODUCT_FOCUS_COPY = {
    "DPN-Operational-Control":"Central DPN command and orchestration surface for topology, program health, identity, events and control.",
    "DPN-Aqua-Labs-Point-of-Sale-System":"Retail and aquarium operating system spanning POS, inventory, maintenance, workforce and facility telemetry.",
    "DPN-Death-the-Developer":"Local development agent studio combining code, browser, terminal, research, build, memory and GitHub workflows.",
    "DPN-One":"Unified DPN account, launch, entitlement, billing and security control plane.",
    "DPN-Service-Desk":"IT support workflow for request intake, priority, SLA, assignment, technician work and support history.",
    "DPN-Network-Mapper":"Network discovery and topology workbench for understanding switches, endpoints, VLANs and infrastructure relationships."
  };

  function setupBootSequence() {
    const boot=$("dpn-boot"),lines=$("dpn-boot-lines"),bar=$("dpn-boot-progress"),skip=$("dpn-boot-skip"),replay=$("replay-boot");
    if(!boot||!lines||!bar)return;
    let timers=[];
    const clearTimers=()=>{timers.forEach(clearTimeout);timers=[];};
    const close=()=>{
      clearTimers();
      boot.classList.remove("active");
      boot.setAttribute("aria-hidden","true");
      document.documentElement.classList.remove("dpn-booting");
      try{sessionStorage.setItem("dpn-v42-boot-seen","1");}catch{}
    };
    const run=(force=false)=>{
      clearTimers();
      let seen=false;try{seen=sessionStorage.getItem("dpn-v42-boot-seen")==="1";}catch{}
      if(seen&&!force)return;
      boot.classList.add("active");
      boot.setAttribute("aria-hidden","false");
      document.documentElement.classList.add("dpn-booting");
      lines.innerHTML="";
      bar.style.width="0%";
      const sequence=[
        ["Establishing public command channel","CONNECTED"],
        ["Loading DPN product registry","COMPLETE"],
        ["Indexing public engineering evidence","VERIFIED"],
        ["Initializing visual command fabric","ONLINE"],
        ["Clearance","L1 GREEN // PUBLIC"]
      ];
      sequence.forEach(([label,status],index)=>{
        timers.push(setTimeout(()=>{
          lines.insertAdjacentHTML("beforeend",`<div><span>&gt; ${escapeHtml(label)}</span><b>${escapeHtml(status)}</b></div>`);
          bar.style.width=`${Math.round(((index+1)/sequence.length)*100)}%`;
        },180+index*330));
      });
      timers.push(setTimeout(()=>boot.classList.add("ready"),1900));
      timers.push(setTimeout(close,2550));
    };
    skip?.addEventListener("click",close);
    replay?.addEventListener("click",()=>{boot.classList.remove("ready");run(true);});
    run(false);
  }

  function productFocusVisuals(repoName) {
    const catalog=evidenceForRepo(repoName);
    const runtime=runtimeEvidenceForRepo(repoName).map((item,index)=>({
      title:`${item.product||repoName} // ${item.label||item.file||`Runtime Capture ${index+1}`}`,
      alt:item.label||item.file||"Runtime product capture",src:item.imageUrl,
      slug:slugify(`${repoName}-runtime-${item.file||index}`),type:"runtime",repo:repoName,
      description:item.dataBoundary||"Validated repository-hosted runtime evidence.",runtime:true
    }));
    const seen=new Set();
    return [...runtime,...catalog].filter(item=>{const key=item.src||item.slug;if(!key||seen.has(key))return false;seen.add(key);return true;});
  }

  function setFocusVisual(item,index=null) {
    const image=$("product-focus-image"),badge=$("product-focus-evidence"),boundary=$("focus-boundary-text"),log=$("focus-system-log");
    if(!item)return;
    const resolved=index===null?focusState.visuals.findIndex(entry=>entry.slug===item.slug):index;if(resolved>=0)focusState.index=resolved;
    if(image){image.src=item.src;image.alt=item.alt||item.title;}
    if(badge)badge.textContent=item.type==="runtime"?"ACTUAL CAPTURE":item.type==="source"?"SOURCE-VERIFIED UI":"PROJECT VISUAL";
    if(boundary)boundary.textContent=item.type==="runtime"?"ACTUAL PROJECT / INTERFACE CAPTURE · NOT PRODUCTION HEALTH":item.type==="source"?"SOURCE-VERIFIED INTERFACE · NOT RUNTIME EXECUTION":"PROJECT ARTWORK · NOT APPLICATION PROOF";
    if($("focus-screen-position"))$("focus-screen-position").textContent=`${Math.max(1,focusState.index+1)} / ${Math.max(1,focusState.visuals.length)}`;
    if($("focus-screen-title"))$("focus-screen-title").textContent=item.title||"PUBLIC VISUAL";
    document.querySelectorAll("#product-focus-gallery button,#product-focus-mosaic button").forEach(button=>button.classList.toggle("active",button.dataset.focusSlug===item.slug));
    if(log){log.insertAdjacentHTML("beforeend",`<p>&gt; visual loaded // ${escapeHtml(item.title)}</p>`);while(log.children.length>8)log.firstElementChild?.remove();}
  }


  function stepProductFocus(delta) {
    if(!focusState.visuals.length)return;
    const next=(focusState.index+delta+focusState.visuals.length)%focusState.visuals.length;
    setFocusVisual(focusState.visuals[next],next);
  }

  function renderFocusMosaic() {
    const mosaic=$("product-focus-mosaic");if(!mosaic)return;
    const visuals=focusState.visuals.slice(0,6);
    mosaic.innerHTML=visuals.length?visuals.map((item,index)=>`<button type="button" data-focus-slug="${escapeHtml(item.slug)}" class="${index===focusState.index?"active":""}"><img src="${escapeHtml(item.src)}" alt=""><span>${String(index+1).padStart(2,"0")}</span><b>${escapeHtml(item.type==="runtime"?"ACTUAL CAPTURE":item.type==="source"?"SOURCE UI":"ARTWORK")}</b></button>`).join(""):'<p>NO ADDITIONAL PUBLIC VISUALS MAPPED</p>';
    mosaic.querySelectorAll("[data-focus-slug]").forEach(button=>button.addEventListener("click",()=>{const index=focusState.visuals.findIndex(item=>item.slug===button.dataset.focusSlug);if(index>=0)setFocusVisual(focusState.visuals[index],index);}));
  }

  function openProductFocus(repoName) {
    const dialog=$("product-focus");if(!dialog)return;
    const repo=state.repos.find(item=>item.name===repoName),world=document.querySelector(`.product-world[data-repo="${CSS.escape(repoName)}"]`),visuals=productFocusVisuals(repoName);
    focusState.repo=repoName;focusState.visuals=visuals;focusState.index=0;
    const fallback=world?.querySelector(".world-visual-frame img"),title=world?.dataset.worldName||repoName.replaceAll("-"," ");
    if($("product-focus-title"))$("product-focus-title").textContent=title;
    if($("product-focus-description"))$("product-focus-description").textContent=PRODUCT_FOCUS_COPY[repoName]||repo?.description||"Public DPN Technology product surface.";
    if($("product-focus-code"))$("product-focus-code").textContent=`DPN://PRODUCT_FOCUS/${String(title).replaceAll(" ","_")}`;
    const releases=state.releases.filter(item=>item.repo===repoName),runtime=runtimeEvidenceForRepo(repoName);
    if($("focus-stat-push"))$("focus-stat-push").textContent=repo?.pushed_at?relativeAge(repo.pushed_at):"—";
    if($("focus-stat-releases"))$("focus-stat-releases").textContent=String(releases.length);
    if($("focus-stat-visuals"))$("focus-stat-visuals").textContent=String(visuals.length);
    if($("focus-stat-language"))$("focus-stat-language").textContent=repo?.language||"—";
    const repoLink=$("focus-open-repo");if(repoLink)repoLink.href=repo?.html_url||`https://github.com/${ORG}/${encodeURIComponent(repoName)}`;
    const dossier=$("focus-open-dossier");if(dossier)dossier.dataset.focusRepo=repoName;
    const gallery=$("product-focus-gallery");
    if(gallery){
      gallery.innerHTML=visuals.length?visuals.slice(0,14).map((item,index)=>`<button type="button" data-focus-slug="${escapeHtml(item.slug)}" class="${index===0?"active":""}"><img src="${escapeHtml(item.src)}" alt=""><span>${escapeHtml(item.title)}</span><b>${escapeHtml(item.type==="runtime"?"ACTUAL":item.type==="source"?"SOURCE":"ART")}</b></button>`).join(""):'<p>No additional mapped visual evidence is available for this public product yet.</p>';
      gallery.querySelectorAll("[data-focus-slug]").forEach(button=>button.addEventListener("click",()=>{const index=visuals.findIndex(entry=>entry.slug===button.dataset.focusSlug);if(index>=0)setFocusVisual(visuals[index],index);}));
    }
    renderFocusMosaic();
    const first=visuals[0];
    if(first)setFocusVisual(first,0);
    else if(fallback){
      const image=$("product-focus-image");if(image){image.src=fallback.getAttribute("src");image.alt=fallback.getAttribute("alt")||title;}
      if($("product-focus-evidence"))$("product-focus-evidence").textContent="PUBLIC PRODUCT VIEW";
      if($("focus-boundary-text"))$("focus-boundary-text").textContent="PUBLIC SOURCE PRESENTATION";
      if($("focus-screen-position"))$("focus-screen-position").textContent="1 / 1";
      if($("focus-screen-title"))$("focus-screen-title").textContent=title;
    }
    if($("focus-system-log"))$("focus-system-log").innerHTML=`<p>&gt; focus target // ${escapeHtml(repoName)}</p><p>&gt; mapped visuals // ${visuals.length}</p><p>&gt; runtime evidence // ${runtime.length}</p><p>&gt; release records // ${releases.length}</p>`;
    dialog.showModal();document.documentElement.classList.add("product-focus-open");
  }

  function updateWorldEvidenceStrips() {
    document.querySelectorAll(".product-world[data-repo]").forEach(world=>{
      const repoName=world.dataset.repo;
      const visuals=productFocusVisuals(repoName).slice(0,6);
      const visual=world.querySelector(".world-visual");
      if(!visual)return;
      let strip=visual.querySelector(".world-evidence-strip");
      if(!strip){strip=document.createElement("div");strip.className="world-evidence-strip";visual.appendChild(strip);}
      strip.innerHTML=visuals.length?visuals.map((item,index)=>`<button type="button" class="${index===0?"active":""}" data-world-visual="${escapeHtml(item.slug)}"><img src="${escapeHtml(item.src)}" alt=""><span>${escapeHtml(item.type==="runtime"?"ACTUAL":item.type==="source"?"SOURCE":"ART")}</span></button>`).join(""):'<span class="world-evidence-empty">ADDITIONAL VISUAL EVIDENCE PENDING</span>';
      strip.querySelectorAll("[data-world-visual]").forEach(button=>button.addEventListener("click",()=>{
        const item=visuals.find(entry=>entry.slug===button.dataset.worldVisual);if(!item)return;
        const frame=world.querySelector(".world-visual-frame"),image=frame?.querySelector("img"),badge=frame?.querySelector(".world-window-head b"),proof=world.querySelector(".world-proof b");
        if(image){image.src=item.src;image.alt=item.alt||item.title;}
        if(badge)badge.textContent=item.type==="runtime"?"ACTUAL CAPTURE":item.type==="source"?"SOURCE-VERIFIED":"PROJECT VISUAL";
        if(proof)proof.textContent=item.type==="runtime"?"ACTUAL PROJECT CAPTURE · NOT PRODUCTION HEALTH":item.type==="source"?"SOURCE-VERIFIED UI · NOT RUNTIME EXECUTION":"PROJECT ARTWORK · NOT APPLICATION PROOF";
        strip.querySelectorAll("button").forEach(node=>node.classList.toggle("active",node===button));
      }));
    });
  }

  function setupImmersiveSystems() {
    setupBootSequence();
    document.querySelectorAll("[data-world-focus]").forEach(button=>button.addEventListener("click",()=>openProductFocus(button.dataset.worldFocus)));
    $("focus-prev")?.addEventListener("click",()=>stepProductFocus(-1));$("focus-next")?.addEventListener("click",()=>stepProductFocus(1));
    $("focus-open-dossier")?.addEventListener("click",event=>{const repoName=event.currentTarget.dataset.focusRepo;$("product-focus")?.close();if(repoName)openProjectDossier(repoName);});
    $("product-focus")?.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();stepProductFocus(-1);}if(event.key==="ArrowRight"){event.preventDefault();stepProductFocus(1);}});
    $("product-focus")?.addEventListener("close",()=>document.documentElement.classList.remove("product-focus-open"));
    updateWorldEvidenceStrips();
  }


  const PRODUCT_THEATER_CONFIG = {
    "DPN-Operational-Control":{
      code:"OC",label:"OPERATIONAL CONTROL",boot:"COMMAND NEXUS",
      nodes:[
        ["COMMAND NEXUS","Primary public control surface and command navigation."],
        ["TOPOLOGY","Product and system relationship visualization."],
        ["PROGRAM HEALTH","Application-status and evidence presentation surface."],
        ["IDENTITY / ZERO TRUST","Identity, role and policy-oriented control concepts."],
        ["EVENT STREAM","Operational event and activity presentation."],
        ["WAR ROOM","Focused incident / operational coordination surface."]
      ]
    },
    "DPN-Aqua-Labs-Point-of-Sale-System":{
      code:"AQUA",label:"AQUA LABS",boot:"STORE COMMAND",
      nodes:[
        ["REGISTER / POS","Barcode-first retail transaction workflow."],
        ["INVENTORY","Catalog, stock, pricing and reorder operations."],
        ["PURCHASING","Demand, purchase order and receiving workflow."],
        ["MAINTENANCE","Recurring and one-time facility work orders."],
        ["STORE NETWORK","Terminal registry and store-hub concepts."],
        ["AQUANODE","Aquarium sensor and facility telemetry interface."]
      ]
    },
    "DPN-Death-the-Developer":{
      code:"DTD",label:"DEATH THE DEVELOPER",boot:"AGENT STUDIO",
      nodes:[
        ["PROJECT EXPLORER","Project/file navigation and workspace context."],
        ["EDITOR","Multi-file code-editing surface."],
        ["TERMINAL","Command execution and run-log surface."],
        ["BROWSER / PREVIEW","Application preview and browser verification."],
        ["RESEARCH","Research and evidence-gathering workflow."],
        ["AUTONOMOUS BUILD","Agent-driven build workflow with bounded controls."]
      ]
    },
    "DPN-One":{
      code:"ONE",label:"DPN ONE",boot:"UNIFIED CONTROL PLANE",
      nodes:[
        ["ONE IDENTITY","Unified account / identity concept."],
        ["APP LAUNCHER","Product discovery and launch surface."],
        ["LICENSING","Entitlement and license-management workflow."],
        ["BILLING","Billing / subscription management surface."],
        ["SECURITY POSTURE","Account and product security presentation."],
        ["ACTIVITY","User / platform activity presentation."]
      ]
    },
    "DPN-Service-Desk":{
      code:"DESK",label:"SERVICE DESK",boot:"SUPPORT OPERATIONS",
      nodes:[
        ["REQUEST INTAKE","User-facing support request creation."],
        ["PRIORITY / SLA","Priority and response expectation handling."],
        ["ASSIGNMENT","Technician ownership and workflow routing."],
        ["TECHNICIAN QUEUE","Operational support work queue."],
        ["REMOTE SUPPORT","Support-session record concepts."],
        ["CLOSED RECORDS","Closed-ticket history and export workflow."]
      ]
    },
    "DPN-Network-Mapper":{
      code:"MAP",label:"NETWORK MAPPER",boot:"DISCOVERY WORKBENCH",
      nodes:[
        ["DISCOVERY","Network device and service discovery."],
        ["TOPOLOGY","Relationship visualization and map interaction."],
        ["DEVICES","Endpoint, switch, AP and server inventory."],
        ["VLAN / NETWORK","Network-segmentation and address context."],
        ["EVIDENCE","Discovery evidence and source-state presentation."],
        ["EXPORT / REVIEW","Operational review and export workflow."]
      ]
    }
  };

  const worldTheaterState=new Map();

  function theaterEvidenceLabel(item){
    return item?.type==="runtime"?"ACTUAL CAPTURE":item?.type==="source"?"SOURCE-VERIFIED UI":item?.type==="artwork"?"PROJECT ARTWORK":"PUBLIC VISUAL";
  }

  function theaterProofText(item){
    return item?.type==="runtime"
      ?"ACTUAL PROJECT / INTERFACE CAPTURE · NOT PRODUCTION HEALTH"
      :item?.type==="source"
        ?"SOURCE-VERIFIED UI · NOT RUNTIME EXECUTION"
        :"PROJECT ARTWORK · NOT APPLICATION PROOF";
  }


  const liveShellState=new Map();

  function shellModuleMatch(visuals,moduleName){
    const words=String(moduleName||"").toLowerCase().split(/[^a-z0-9]+/).filter(word=>word.length>3);
    if(!words.length)return -1;
    return visuals.findIndex(item=>{
      const hay=`${item.title||""} ${item.description||""}`.toLowerCase();
      return words.some(word=>hay.includes(word));
    });
  }

  function shellEvidenceClass(item){
    return item?.type==="runtime"?"actual":item?.type==="source"?"source":"art";
  }

  function syncLiveProductShell(world,index=0){
    const repoName=world?.dataset.repo,stateEntry=liveShellState.get(repoName);
    if(!world||!stateEntry?.visuals?.length)return;
    const visuals=stateEntry.visuals;
    index=Math.max(0,Math.min(index,visuals.length-1));
    stateEntry.index=index;
    const item=visuals[index];
    const shell=world.querySelector(".product-live-shell");if(!shell)return;
    const main=shell.querySelector("[data-shell-main-image]"),badge=shell.querySelector("[data-shell-evidence]"),title=shell.querySelector("[data-shell-title]"),pos=shell.querySelector("[data-shell-position]"),proof=shell.querySelector("[data-shell-proof]");
    if(main){main.src=item.src;main.alt=item.alt||item.title||"DPN product evidence";}
    if(badge){badge.textContent=theaterEvidenceLabel(item);badge.className=`shell-evidence-badge ${shellEvidenceClass(item)}`;}
    if(title)title.textContent=item.title||"PUBLIC PRODUCT VISUAL";
    if(pos)pos.textContent=`${String(index+1).padStart(2,"0")} / ${String(visuals.length).padStart(2,"0")}`;
    if(proof)proof.textContent=theaterProofText(item);
    shell.querySelectorAll("[data-shell-screen]").forEach(button=>button.classList.toggle("active",Number(button.dataset.shellScreen)===index));

    const sideIndices=[(index+1)%visuals.length,(index+2)%visuals.length];
    shell.querySelectorAll("[data-shell-side]").forEach((node,slot)=>{
      const side=visuals[sideIndices[slot]];
      const image=node.querySelector("img"),label=node.querySelector("b"),type=node.querySelector("small");
      if(image){image.src=side.src;image.alt=side.alt||side.title||"DPN product evidence";}
      if(label)label.textContent=side.title||"PUBLIC VISUAL";
      if(type)type.textContent=theaterEvidenceLabel(side);
      node.dataset.shellScreen=String(sideIndices[slot]);
    });
  }

  function activateShellModule(world,moduleIndex){
    const repoName=world.dataset.repo,config=PRODUCT_THEATER_CONFIG[repoName],entry=liveShellState.get(repoName),shell=world.querySelector(".product-live-shell");
    if(!config||!entry||!shell)return;
    const node=config.nodes[moduleIndex];if(!node)return;
    shell.querySelectorAll("[data-shell-module]").forEach(button=>button.classList.toggle("active",Number(button.dataset.shellModule)===moduleIndex));
    const title=shell.querySelector("[data-shell-module-title]"),desc=shell.querySelector("[data-shell-module-desc]"),match=shell.querySelector("[data-shell-module-match]");
    if(title)title.textContent=node[0];
    if(desc)desc.textContent=node[1];
    const visualIndex=shellModuleMatch(entry.visuals,node[0]);
    if(visualIndex>=0){
      if(match)match.textContent="DIRECT MAPPED VISUAL FOUND";
      applyWorldTheaterScreen(world,entry.visuals[visualIndex],visualIndex);
    }else if(match){
      match.textContent="NO DIRECT MAPPED SCREEN // CURRENT EVIDENCE RETAINED";
    }
    shell.dataset.activeModule=String(moduleIndex);
  }

  function toggleShellArchitecture(world){
    const shell=world.querySelector(".product-live-shell");if(!shell)return;
    const enabled=shell.classList.toggle("architecture-mode");
    const button=shell.querySelector("[data-shell-architecture]");
    if(button)button.textContent=enabled?"HIDE ARCH PATHS":"SHOW ARCH PATHS";
  }

  function renderLiveProductShell(world){
    const repoName=world.dataset.repo,config=PRODUCT_THEATER_CONFIG[repoName];
    if(!config)return;
    const visuals=productFocusVisuals(repoName).slice(0,12);
    const repo=state.repos.find(item=>item.name===repoName);
    const releases=state.releases.filter(item=>item.repo===repoName);
    const existing=liveShellState.get(repoName)||{index:0};
    existing.visuals=visuals;
    existing.index=Math.min(existing.index,Math.max(0,visuals.length-1));
    liveShellState.set(repoName,existing);

    const promoted=visuals[0]?.type==="runtime";
    let shell=world.querySelector(".product-live-shell");
    if(!shell){
      shell=document.createElement("section");shell.className="product-live-shell";
      const visual=world.querySelector(".world-visual");
      const theater=visual?.querySelector(".world-runtime-theater");
      if(theater)visual.insertBefore(shell,theater); else visual?.appendChild(shell);
    }

    const defaultItem=visuals[existing.index];
    shell.innerHTML=`
      <header class="shell-chrome">
        <div class="shell-brand"><span class="shell-brand-orb"><img src="./assets/dpn-logo.webp" alt=""></span><div><small>DPN://${escapeHtml(config.code)}_LIVE_SHELL</small><b>${escapeHtml(config.label)}</b></div></div>
        <div class="shell-classification"><span>SIMULATED INTERACTION SHELL</span><strong class="${promoted?"runtime":"source"}">${promoted?"RUNTIME CAPTURE PROMOTED":"SOURCE / STATIC EVIDENCE LEAD"}</strong></div>
      </header>
      <div class="shell-workspace">
        <nav class="shell-nav" aria-label="${escapeHtml(config.label)} source-structured navigation">
          <span class="shell-nav-title">SOURCE-STRUCTURED NAV</span>
          ${config.nodes.map(([name],index)=>`<button type="button" data-shell-module="${index}" class="${index===0?"active":""}"><i>${String(index+1).padStart(2,"0")}</i><b>${escapeHtml(name)}</b></button>`).join("")}
        </nav>
        <div class="shell-monitor-wall">
          <section class="shell-monitor shell-monitor-main">
            <div class="shell-monitor-head"><span>PRIMARY EVIDENCE MONITOR</span><span data-shell-position>${visuals.length?`${String(existing.index+1).padStart(2,"0")} / ${String(visuals.length).padStart(2,"0")}`:"00 / 00"}</span></div>
            <div class="shell-monitor-screen">
              ${defaultItem?`<img data-shell-main-image src="${escapeHtml(defaultItem.src)}" alt="${escapeHtml(defaultItem.alt||defaultItem.title||"DPN product evidence")}">`:'<div class="shell-no-evidence">NO MAPPED PRODUCT VISUAL</div>'}
              <span data-shell-evidence class="shell-evidence-badge ${shellEvidenceClass(defaultItem)}">${escapeHtml(defaultItem?theaterEvidenceLabel(defaultItem):"NO VISUAL")}</span>
              <div class="shell-monitor-scan"></div>
            </div>
            <div class="shell-monitor-meta"><b data-shell-title>${escapeHtml(defaultItem?.title||config.boot)}</b><small data-shell-proof>${escapeHtml(defaultItem?theaterProofText(defaultItem):"PUBLIC SOURCE PRESENTATION ONLY")}</small></div>
          </section>
          <aside class="shell-side-monitors">
            ${[1,2].map((offset,slot)=>{
              const item=visuals.length?visuals[(existing.index+offset)%visuals.length]:null;
              return `<button type="button" class="shell-monitor shell-monitor-side" data-shell-side="${slot}" data-shell-screen="${visuals.length?(existing.index+offset)%visuals.length:0}">
                <div class="shell-monitor-head"><span>MONITOR 0${slot+2}</span><span>${item?"PUBLIC":"EMPTY"}</span></div>
                <div class="shell-side-screen">${item?`<img src="${escapeHtml(item.src)}" alt="">`:'<div class="shell-no-evidence">NO VISUAL</div>'}</div>
                <div><b>${escapeHtml(item?.title||"NO MAPPED VISUAL")}</b><small>${escapeHtml(item?theaterEvidenceLabel(item):"—")}</small></div>
              </button>`;
            }).join("")}
          </aside>
          <div class="shell-architecture-layer" aria-hidden="true">
            <svg viewBox="0 0 900 460" preserveAspectRatio="none">
              <path d="M90 62L450 230"/><path d="M90 130L450 230"/><path d="M90 198L450 230"/><path d="M90 266L450 230"/><path d="M90 334L450 230"/><path d="M90 402L450 230"/>
              <path d="M450 230L720 120"/><path d="M450 230L720 340"/>
            </svg>
            <div class="shell-arch-core"><img src="./assets/dpn-logo.webp" alt=""><span>${escapeHtml(config.code)}</span></div>
          </div>
        </div>
        <aside class="shell-context">
          <div class="shell-context-head"><span>ACTIVE MODULE</span><b data-shell-module-match>SOURCE STRUCTURE</b></div>
          <h4 data-shell-module-title>${escapeHtml(config.nodes[0]?.[0]||config.boot)}</h4>
          <p data-shell-module-desc>${escapeHtml(config.nodes[0]?.[1]||"Public product subsystem.")}</p>
          <div class="shell-context-stats">
            <span><small>SCREENS</small><b>${visuals.length}</b></span>
            <span><small>ACTUAL</small><b>${visuals.filter(item=>item.type==="runtime").length}</b></span>
            <span><small>RELEASES</small><b>${releases.length}</b></span>
            <span><small>LANGUAGE</small><b>${escapeHtml(repo?.language||"—")}</b></span>
          </div>
          <div class="shell-context-boundary"><span>BOUNDARY</span><b>NAVIGATION IS SIMULATED // MONITORS USE MAPPED PUBLIC EVIDENCE</b></div>
        </aside>
      </div>
      <div class="shell-command-bar">
        <button type="button" data-shell-prev>← PREV SCREEN</button>
        <button type="button" data-shell-next>NEXT SCREEN →</button>
        <button type="button" data-shell-architecture>SHOW ARCH PATHS</button>
        <button type="button" data-shell-focus>FULL FOCUS</button>
        <button type="button" data-shell-boot>BOOT PUBLIC DEMO</button>
        <span>${repo?.pushed_at?`PUBLIC PUSH // ${escapeHtml(relativeAge(repo.pushed_at))}`:"PUBLIC PUSH // —"}</span>
      </div>
    `;

    shell.querySelectorAll("[data-shell-module]").forEach(button=>button.addEventListener("click",()=>activateShellModule(world,Number(button.dataset.shellModule))));
    shell.querySelectorAll("[data-shell-side]").forEach(button=>button.addEventListener("click",()=>{
      const index=Number(button.dataset.shellScreen),item=visuals[index];if(item)applyWorldTheaterScreen(world,item,index);
    }));
    shell.querySelector("[data-shell-prev]")?.addEventListener("click",()=>{
      if(!visuals.length)return;const index=(existing.index-1+visuals.length)%visuals.length;applyWorldTheaterScreen(world,visuals[index],index);
    });
    shell.querySelector("[data-shell-next]")?.addEventListener("click",()=>{
      if(!visuals.length)return;const index=(existing.index+1)%visuals.length;applyWorldTheaterScreen(world,visuals[index],index);
    });
    shell.querySelector("[data-shell-architecture]")?.addEventListener("click",()=>toggleShellArchitecture(world));
    shell.querySelector("[data-shell-focus]")?.addEventListener("click",()=>openProductFocus(repoName));
    shell.querySelector("[data-shell-boot]")?.addEventListener("click",()=>bootWorldRuntimeTheater(world));
    if(defaultItem)syncLiveProductShell(world,existing.index);
  }

  function renderAllLiveProductShells(){
    document.querySelectorAll(".product-world[data-repo]").forEach(renderLiveProductShell);
    const supported=[...document.querySelectorAll(".product-world[data-repo]")].filter(world=>PRODUCT_THEATER_CONFIG[world.dataset.repo]);
    const promoted=supported.filter(world=>productFocusVisuals(world.dataset.repo)[0]?.type==="runtime").length;
    const totalScreens=supported.reduce((sum,world)=>sum+productFocusVisuals(world.dataset.repo).length,0);
    const banner=$("runtime-theater-state");
    if(banner)banner.textContent=`LIVE SHELLS // ${promoted} RUNTIME PROMOTED // ${supported.length-promoted} SOURCE FALLBACK // ${totalScreens} SCREENS`;
  }

  function setupLiveProductShells(){
    renderAllLiveProductShells();
  }

  function applyWorldTheaterScreen(world,item,index=0){
    if(!world||!item)return;
    const frame=world.querySelector(".world-visual-frame"),image=frame?.querySelector("img"),badge=frame?.querySelector(".world-window-head b"),proof=world.querySelector(".world-proof b");
    if(image){image.src=item.src;image.alt=item.alt||item.title||"DPN product visual";}
    if(badge)badge.textContent=theaterEvidenceLabel(item);
    if(proof)proof.textContent=theaterProofText(item);
    world.querySelectorAll("[data-theater-screen]").forEach(button=>button.classList.toggle("active",Number(button.dataset.theaterScreen)===index));
    const pos=world.querySelector("[data-theater-position]"),title=world.querySelector("[data-theater-screen-title]");
    const visuals=worldTheaterState.get(world.dataset.repo)?.visuals||[];
    if(pos)pos.textContent=`S${String(index+1).padStart(2,"0")} / ${String(Math.max(1,visuals.length)).padStart(2,"0")}`;
    if(title)title.textContent=item.title||"PUBLIC PRODUCT VISUAL";
    const stateEntry=worldTheaterState.get(world.dataset.repo);if(stateEntry)stateEntry.index=index;
    const liveEntry=liveShellState.get(world.dataset.repo);if(liveEntry)liveEntry.index=index;
    syncLiveProductShell(world,index);
  }

  function renderWorldRuntimeTheater(world){
    const repoName=world.dataset.repo,config=PRODUCT_THEATER_CONFIG[repoName];
    if(!config)return;
    const repo=state.repos.find(item=>item.name===repoName);
    const visuals=productFocusVisuals(repoName).slice(0,10);
    const runtimeCount=visuals.filter(item=>item.type==="runtime").length;
    const sourceCount=visuals.filter(item=>item.type==="source").length;
    const artCount=visuals.filter(item=>item.type==="artwork").length;
    const releases=state.releases.filter(item=>item.repo===repoName);
    const existing=worldTheaterState.get(repoName)||{index:0,visuals:[]};
    existing.visuals=visuals;existing.index=Math.min(existing.index,Math.max(0,visuals.length-1));worldTheaterState.set(repoName,existing);

    let theater=world.querySelector(".world-runtime-theater");
    if(!theater){
      theater=document.createElement("section");theater.className="world-runtime-theater";
      const visual=world.querySelector(".world-visual");visual?.appendChild(theater);
    }
    theater.innerHTML=`
      <header>
        <div><span>DPN://${escapeHtml(config.code)}_RUNTIME_THEATER</span><b>PUBLIC DEMO SURFACE</b></div>
        <div class="theater-live"><i class="live-dot"></i><strong>${repo?"PUBLIC SOURCE ONLINE":"STATIC FALLBACK"}</strong></div>
      </header>
      <div class="theater-command-strip">
        <button type="button" data-theater-boot>BOOT PUBLIC DEMO</button>
        <button type="button" data-theater-arch>ARCHITECTURE</button>
        <button type="button" data-theater-focus>FULL FOCUS</button>
        <span data-theater-position>S01 / ${String(Math.max(1,visuals.length)).padStart(2,"0")}</span>
      </div>
      <div class="theater-screen-title"><span>ACTIVE SCREEN</span><b data-theater-screen-title>${escapeHtml(visuals[existing.index]?.title||config.boot)}</b></div>
      <div class="theater-screen-bank">${visuals.length?visuals.map((item,index)=>`
        <button type="button" data-theater-screen="${index}" class="${index===existing.index?"active":""}">
          <span>S${String(index+1).padStart(2,"0")}</span>
          <img src="${escapeHtml(item.src)}" alt="">
          <div><b>${escapeHtml((item.title||"Public visual").split("//").pop().trim())}</b><small>${escapeHtml(theaterEvidenceLabel(item))}</small></div>
        </button>`).join(""):'<p class="theater-empty">NO MAPPED PRODUCT SCREENS YET</p>'}</div>
      <div class="theater-telemetry">
        <span><small>ACTUAL</small><b>${runtimeCount}</b></span>
        <span><small>SOURCE UI</small><b>${sourceCount}</b></span>
        <span><small>ARTWORK</small><b>${artCount}</b></span>
        <span><small>RELEASES</small><b>${releases.length}</b></span>
        <span><small>LAST PUSH</small><b>${repo?.pushed_at?escapeHtml(relativeAge(repo.pushed_at)):"—"}</b></span>
      </div>
    `;
    theater.querySelectorAll("[data-theater-screen]").forEach(button=>button.addEventListener("click",()=>{
      const index=Number(button.dataset.theaterScreen),item=visuals[index];if(item)applyWorldTheaterScreen(world,item,index);
    }));
    theater.querySelector("[data-theater-boot]")?.addEventListener("click",()=>bootWorldRuntimeTheater(world));
    theater.querySelector("[data-theater-arch]")?.addEventListener("click",()=>openWorldArchitecture(world));
    theater.querySelector("[data-theater-focus]")?.addEventListener("click",()=>openProductFocus(repoName));
    if(visuals[existing.index])applyWorldTheaterScreen(world,visuals[existing.index],existing.index);
  }

  function renderAllWorldRuntimeTheaters(){
    document.querySelectorAll(".product-world[data-repo]").forEach(renderWorldRuntimeTheater);
    const total=[...worldTheaterState.values()].reduce((sum,item)=>sum+(item.visuals?.length||0),0);
    const banner=$("runtime-theater-state");
    if(banner)banner.textContent=`PUBLIC EVIDENCE // ${total} MAPPED PRODUCT SCREENS`;
  }

  function ensureWorldTheaterOverlays(world){
    const repoName=world.dataset.repo,config=PRODUCT_THEATER_CONFIG[repoName];
    if(!config)return;
    if(!world.querySelector(".world-demo-boot")){
      const boot=document.createElement("div");boot.className="world-demo-boot";boot.setAttribute("aria-hidden","true");
      boot.innerHTML=`<div class="world-demo-boot-shell"><div class="world-demo-logo"><img src="./assets/dpn-logo.webp" alt=""></div><span>PUBLIC PRESENTATION BOOT</span><h4>${escapeHtml(config.label)}</h4><div class="world-demo-lines"></div><div class="world-demo-progress"><i></i></div><small>THIS IS A PUBLIC PRESENTATION SEQUENCE · NOT A LIVE SYSTEM STARTUP</small></div>`;
      world.appendChild(boot);
    }
    if(!world.querySelector(".world-architecture-drawer")){
      const drawer=document.createElement("aside");drawer.className="world-architecture-drawer";drawer.setAttribute("aria-hidden","true");
      drawer.innerHTML=`
        <header><div><span>DPN://${escapeHtml(config.code)}_ARCHITECTURE</span><h4>${escapeHtml(config.label)}</h4></div><button type="button" data-arch-close>CLOSE ×</button></header>
        <p>Public product architecture view derived from visible repository/product scope. Nodes describe product subsystems, not verified live service connections.</p>
        <div class="world-arch-nodes">${config.nodes.map(([name,desc],index)=>`<article><span>${String(index+1).padStart(2,"0")}</span><div><b>${escapeHtml(name)}</b><small>${escapeHtml(desc)}</small></div></article>`).join("")}</div>
        <footer><span>BOUNDARY</span><b>PUBLIC PRODUCT MODEL // NOT RUNTIME TOPOLOGY</b></footer>`;
      drawer.querySelector("[data-arch-close]")?.addEventListener("click",()=>{drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");});
      world.appendChild(drawer);
    }
  }

  function bootWorldRuntimeTheater(world){
    const repoName=world.dataset.repo,config=PRODUCT_THEATER_CONFIG[repoName];if(!config)return;
    ensureWorldTheaterOverlays(world);
    const overlay=world.querySelector(".world-demo-boot"),lines=overlay?.querySelector(".world-demo-lines"),bar=overlay?.querySelector(".world-demo-progress i");
    if(!overlay||!lines||!bar)return;
    const repo=state.repos.find(item=>item.name===repoName),visuals=productFocusVisuals(repoName),runtime=visuals.filter(item=>item.type==="runtime"),source=visuals.filter(item=>item.type==="source"),releases=state.releases.filter(item=>item.repo===repoName);
    overlay.classList.add("active");overlay.setAttribute("aria-hidden","false");lines.innerHTML="";bar.style.width="0%";
    const sequence=[
      ["Public repository",repo?"DISCOVERED":"STATIC FALLBACK"],
      ["Mapped product screens",String(visuals.length)],
      ["Validated runtime captures",String(runtime.length)],
      ["Source-verified interfaces",String(source.length)],
      ["Public release records",String(releases.length)],
      ["Evidence boundary","ENFORCED"],
      [config.boot,"READY"]
    ];
    sequence.forEach(([label,status],index)=>window.setTimeout(()=>{
      lines.insertAdjacentHTML("beforeend",`<div><span>&gt; ${escapeHtml(label)}</span><b>${escapeHtml(status)}</b></div>`);
      bar.style.width=`${Math.round(((index+1)/sequence.length)*100)}%`;
    },120+index*150));
    window.setTimeout(()=>overlay.classList.add("ready"),120+sequence.length*150);
    window.setTimeout(()=>{overlay.classList.remove("active","ready");overlay.setAttribute("aria-hidden","true");},1850);
  }

  function openWorldArchitecture(world){
    ensureWorldTheaterOverlays(world);
    const drawer=world.querySelector(".world-architecture-drawer");if(!drawer)return;
    drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");
  }

  function setupProductRuntimeTheater(){
    document.querySelectorAll(".product-world[data-repo]").forEach(world=>{ensureWorldTheaterOverlays(world);renderWorldRuntimeTheater(world);});
    renderAllWorldRuntimeTheaters();
  }


  const UI_SCALE_KEY="dpn-command-center-ui-scale-v4.2";

  function applyUiScale(mode){
    const root=document.documentElement;
    ["ui-scale-standard","ui-scale-large","ui-scale-xl"].forEach(name=>root.classList.remove(name));
    const safe=["standard","large","xl"].includes(mode)?mode:"large";
    root.classList.add(`ui-scale-${safe}`);
    root.dataset.uiScale=safe;
    const button=$("readability-toggle");
    if(button){
      button.textContent=`TEXT // ${safe==="xl"?"XL":safe==="standard"?"STD":"L"}`;
      button.setAttribute("aria-label",`Interface text size: ${safe}. Activate to cycle.`);
    }
    try{localStorage.setItem(UI_SCALE_KEY,safe);}catch{}
  }

  function setupReadability(){
    let mode="large";
    try{mode=localStorage.getItem(UI_SCALE_KEY)||"large";}catch{}
    applyUiScale(mode);
    $("readability-toggle")?.addEventListener("click",()=>{
      const current=document.documentElement.dataset.uiScale||"large";
      const next=current==="large"?"xl":current==="xl"?"standard":"large";
      applyUiScale(next);
      addTerminal("VIEW",`Readability scale → ${next.toUpperCase()}`);
    });
  }

  function setupVerificationBoard() {
    $("verification-search")?.addEventListener("input",renderVerificationBoard);
    $("verification-filter")?.addEventListener("change",renderVerificationBoard);
  }

  function setupEvents() {
    els.search?.addEventListener("input", renderProjects);
    els.stateFilter?.addEventListener("change", renderProjects);
    els.refresh?.addEventListener("click", loadTelemetry);
    $("scan-capture-runs")?.addEventListener("click", scanCaptureRuns);
    els.resetProjectFilters?.addEventListener("click", () => {
      if (els.search) els.search.value="";
      if (els.stateFilter) els.stateFilter.value="all";
      renderProjects();
    });
    els.meshDrawerClose?.addEventListener("click", () => {
      els.meshDrawer?.classList.remove("open");
      els.meshDrawer?.setAttribute("aria-hidden","true");
      els.topology?.querySelectorAll(".selected").forEach(node=>node.classList.remove("selected"));
      clearDeepLink("mesh");
      resetBrowserContext();
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", () => {
        const id = anchor.getAttribute("href").slice(1);
        if (id) addTerminal("NAV", `Opening public section: ${id}`);
      });
    });
  }

  setupEvents();
  setupReadability();
  setupVisualOverdrive();
  setupProductWorlds();
  setupImmersiveSystems();
  setupProductRuntimeTheater();
  setupLiveProductShells();
  setupCommandBridge();
  updateVisualOverdrive();
  updateProductWorldStats();
  updateCommandBridge();
  setupShareView();
  setupNetworkState();
  setupPresentationMode();
  setupVerificationBoard();
  setupProductFamilies();
  setupVisualEvidenceRegistry();
  setupEvidenceInspector();
  setupDossierDialogs();
  setupVisualMode();
  setupPwa();
  updateEvidenceCoverage();
  setupStormToggle();
  $("project-dossier")?.addEventListener("close",()=>{clearDeepLink("project");resetBrowserContext();});
  $("release-inspector")?.addEventListener("close",()=>{clearDeepLink("release");resetBrowserContext();});
  $("evidence-inspector")?.addEventListener("close",()=>{delete document.documentElement.dataset.productTheme;clearDeepLink("evidence");resetBrowserContext();});
  setupClock();
  setupArchitecture();
  setupCommandPalette();
  setupDpnStorm();
  loadTelemetry();
})();