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
    activeFamily: "all",
    evidenceIndex: 0,
    evidencePinnedSlug: "",
    deepLinkHandled: new Set(),
    visualMode: "full"
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
      [/death the developer/,"DPN-Death-the-Developer"]
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
      return{index,figure,title,description,type,slug,src:image?.getAttribute("src")||"",alt:image?.getAttribute("alt")||title,stamp:figure.querySelector(".gallery-frame > span")?.textContent?.trim()||type.toUpperCase(),repo:evidenceRepoForTitle(title)};
    });
  }

  function evidenceForRepo(repoName){return evidenceCatalog().filter(item=>item.repo===repoName);}

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

  const EVIDENCE_CACHE_KEY = "dpn-command-center-evidence-v2.8";
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

    return {
      readme: Boolean(readmePath),
      security: Boolean(securityPath),
      license: Boolean(licensePath),
      architecture: Boolean(architecturePath),
      paths: {
        readme: readmePath,
        security: securityPath,
        license: licensePath,
        architecture: architecturePath
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
        return [repo.name,{readme:false,security:false,license:false,architecture:false,paths:{},error:true,treeTruncated:false,cached:false}];
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

      const publicIssues = state.repos.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0);
      const totalStars = state.repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = state.repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
      const latest = [...state.repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
      const languages = computeLanguageCounts();

      state.releases = await fetchReleases(state.repos);
      await scanEvidence();

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
    els.projectGrid.innerHTML=repos.map(repo=>`
      <article class="project-card dossier-project-card" data-project="${escapeHtml(repo.name)}">
        <div class="project-meta"><span>PUBLIC</span><span>${escapeHtml(languageLabel(repo))}</span><span>${escapeHtml(FAMILY_LABELS[familyForRepo(repo.name)]||"DPN PRODUCT")}</span><span class="repo-state ${releaseRepos.has(repo.name)?"has-release":(isRecent(repo)?"recent":"")}">${releaseRepos.has(repo.name)?"PUBLIC RELEASE RECORD":(isRecent(repo)?"RECENT PUBLIC PUSH":"PUBLIC SOURCE")}</span></div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(repo.description||"Public DPN Technology source repository. Inspect the dossier for repository-specific public evidence.")}</p>
        <div class="project-meta"><span>PUSH ${escapeHtml(fmtDate(repo.pushed_at))}</span><span>ISSUES ${repo.open_issues_count||0}</span><span>SIZE ${Math.max(1,Math.round((repo.size||0)/1024))} MB</span></div>
        <div class="project-stats"><span class="repo-stars">★ ${repo.stargazers_count||0} STARS</span><span class="repo-forks">⑂ ${repo.forks_count||0} FORKS</span><span>BRANCH ${escapeHtml(repo.default_branch||"main")}</span></div>
        <div class="project-footer project-actions"><button type="button" data-open-dossier="${escapeHtml(repo.name)}">INSPECT DOSSIER</button><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">OPEN REPOSITORY ↗</a></div>
      </article>`).join("");
    els.projectGrid.querySelectorAll("[data-open-dossier]").forEach(button=>button.addEventListener("click",()=>openProjectDossier(button.dataset.openDossier)));
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
    els.meshDrawer.classList.add("open");els.meshDrawer.setAttribute("aria-hidden","false");setDeepLink("mesh",id);
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
    const search = $("visual-evidence-search");
    const counters = {
      all: $("visual-count-all"),
      runtime: $("visual-count-runtime"),
      source: $("visual-count-source"),
      artwork: $("visual-count-art"),
      visible: $("visual-count-visible")
    };

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
    const apply = (filter = activeFilter) => {
      activeFilter = filter;
      const query = String(search?.value || "").trim().toLowerCase();
      let visible = 0;
      figures.forEach(figure => {
        const typeMatch = filter === "all" || typeOf(figure) === filter;
        const searchMatch = !query || String(figure.textContent || "").toLowerCase().includes(query) || [...figure.querySelectorAll("img")].some(img => String(img.alt || "").toLowerCase().includes(query));
        const show = typeMatch && searchMatch;
        figure.hidden = !show;
        if (show) visible++;
      });
      buttons.forEach(button => {
        const active = button.dataset.evidenceFilter === filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (counters.visible) counters.visible.textContent = String(visible);
      registry.dataset.activeFilter = filter;
      addTerminal("EVIDENCE", `Visual evidence filter: ${filter.toUpperCase()} // ${visible} visible`);
    };

    buttons.forEach(button => button.addEventListener("click", () => apply(button.dataset.evidenceFilter || "all")));
    search?.addEventListener("input", () => apply());
    apply("all");
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
    if(details)details.innerHTML=`<div><dt>EVIDENCE TYPE</dt><dd>${escapeHtml(item.type.toUpperCase())}</dd></div><div><dt>INDEX</dt><dd>${safeIndex+1} / ${items.length}</dd></div><div><dt>PUBLIC SOURCE</dt><dd>${escapeHtml(item.repo||"Command Center project evidence")}</dd></div><div><dt>CLAIM BOUNDARY</dt><dd>${item.type==="runtime"?"Captured project/interface output; not production health.":item.type==="source"?"Derived from current visible source structure; not a runtime screenshot.":"Identity artwork; not application evidence."}</dd></div>`;
    const repo=state.repos.find(repo=>repo.name===item.repo);if(repoLink)repoLink.href=repo?.html_url||`https://github.com/${ORG}`;
    document.documentElement.dataset.productTheme=productThemeFor(item);$("evidence-compare")?.setAttribute("hidden","");
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("evidence",item.slug);addTerminal("EVIDENCE",`Opened visual evidence: ${item.title}`);
  }

  function closeEvidenceInspector(){
    const dialog=$("evidence-inspector");if(dialog?.open)dialog.close();delete document.documentElement.dataset.productTheme;clearDeepLink("evidence");
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
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("project",repo.name);addTerminal("DOSSIER",`Opened public project dossier: ${repo.name}`);
  }

  function openReleaseInspector(index,{updateUrl=true}={}){
    const release=state.releases[index],dialog=$("release-inspector");if(!release||!dialog)return;
    const repo=state.repos.find(item=>item.name===release.repo),visuals=evidenceForRepo(release.repo),ev=repo?state.evidence.get(repo.name):null;
    $("release-inspector-title").textContent=`${release.repo} // ${release.tag}`;
    $("release-inspector-body").innerHTML=`<section class="dossier-hero"><div><span>${release.prerelease?"PUBLIC PREVIEW":"PUBLIC RELEASE"}</span><h3>${escapeHtml(release.name)}</h3><p>Published ${escapeHtml(fmtDate(release.published_at))}. This is a GitHub release record, not proof of production deployment.</p></div></section><section class="dossier-grid"><article><h4>RELEASE RECORD</h4><dl><div><dt>REPOSITORY</dt><dd>${escapeHtml(release.repo)}</dd></div><div><dt>TAG</dt><dd>${escapeHtml(release.tag)}</dd></div><div><dt>PUBLISHED</dt><dd>${escapeHtml(fmtDate(release.published_at))}</dd></div><div><dt>VISUAL EVIDENCE</dt><dd>${visuals.length} mapped items</dd></div></dl></article><article><h4>REPOSITORY EVIDENCE CONTEXT</h4><p>${ev?.error?"Public tree evidence is unknown due to an API error.":ev?`${[ev.readme,ev.security,ev.license,ev.architecture].filter(Boolean).length} artifact classes are discoverable in the current public tree scan.`:"Repository tree was not scanned in the current evidence window."}</p></article></section><div class="dossier-footer"><a href="${escapeHtml(release.url)}" target="_blank" rel="noreferrer">OPEN RELEASE ON GITHUB ↗</a>${repo?`<button type="button" data-release-project="${escapeHtml(repo.name)}">OPEN PROJECT DOSSIER</button>`:""}<button type="button" data-copy-release-link>COPY RELEASE LINK</button></div>`;
    $("release-inspector-body").querySelector("[data-release-project]")?.addEventListener("click",event=>{dialog.close();openProjectDossier(event.currentTarget.dataset.releaseProject);});
    $("release-inspector-body").querySelector("[data-copy-release-link]")?.addEventListener("click",async event=>{const key=`${release.repo}::${release.tag}`,url=new URL(location.href);url.searchParams.set("release",key);url.searchParams.delete("project");url.searchParams.delete("evidence");try{await navigator.clipboard.writeText(url.toString());event.currentTarget.textContent="LINK COPIED ✓";}catch{}});
    if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();if(updateUrl)setDeepLink("release",`${release.repo}::${release.tag}`);addTerminal("RELEASE",`Opened public release: ${release.repo} ${release.tag}`);
  }

  function setupDossierDialogs(){
    $("dossier-close")?.addEventListener("click",()=>{if($("project-dossier")?.open)$("project-dossier").close();clearDeepLink("project");});
    $("release-inspector-close")?.addEventListener("click",()=>{if($("release-inspector")?.open)$("release-inspector").close();clearDeepLink("release");});
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
    els.paletteResults.insertAdjacentHTML("beforeend",repoButtons+evidenceButtons+'<button type="button" class="dynamic-command" data-action="actual-captures"><span>CMD</span><strong>Show Actual Captures</strong><small>Filter the evidence museum to runtime/project output</small></button><button type="button" class="dynamic-command" data-action="capture-gaps"><span>CMD</span><strong>Show Capture Gaps</strong><small>Find source-derived screens awaiting runtime capture</small></button>');
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

  function setupEvents() {
    els.search?.addEventListener("input", renderProjects);
    els.stateFilter?.addEventListener("change", renderProjects);
    els.refresh?.addEventListener("click", loadTelemetry);
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
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", () => {
        const id = anchor.getAttribute("href").slice(1);
        if (id) addTerminal("NAV", `Opening public section: ${id}`);
      });
    });
  }

  setupEvents();
  setupProductFamilies();
  setupVisualEvidenceRegistry();
  setupEvidenceInspector();
  setupDossierDialogs();
  setupVisualMode();
  setupPwa();
  updateEvidenceCoverage();
  setupStormToggle();
  $("project-dossier")?.addEventListener("close",()=>clearDeepLink("project"));
  $("release-inspector")?.addEventListener("close",()=>clearDeepLink("release"));
  $("evidence-inspector")?.addEventListener("close",()=>{delete document.documentElement.dataset.productTheme;clearDeepLink("evidence");});
  setupClock();
  setupArchitecture();
  setupCommandPalette();
  setupDpnStorm();
  loadTelemetry();
})();