(() => {
  "use strict";

  const ORG = "DPN-Technology";
  const API = "https://api.github.com";
  const EXCLUDED = new Set([".github"]);
  const state = { repos: [], releases: 0, lastFetch: null };

  const $ = (id) => document.getElementById(id);
  const els = {
    apiState: $("github-api-state"),
    repos: $("metric-repos"),
    push: $("metric-push"),
    pushRepo: $("metric-push-repo"),
    issues: $("metric-issues"),
    releases: $("metric-releases"),
    projectGrid: $("project-grid"),
    search: $("project-search"),
    refresh: $("refresh-telemetry"),
    terminal: $("terminal-body")
  };

  const fmtDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(d);
  };

  const addTerminal = (level, text) => {
    if (!els.terminal) return;
    const p = document.createElement("p");
    const now = new Date().toLocaleTimeString([], {hour12:false});
    p.innerHTML = `<i>${now}</i> <b>[${level}]</b> ${escapeHtml(text)}`;
    els.terminal.appendChild(p);
    els.terminal.scrollTop = els.terminal.scrollHeight;
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");

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

  async function loadTelemetry() {
    els.apiState.textContent = "PUBLIC TELEMETRY SYNCHRONIZING";
    addTerminal("SYNC","Requesting public organization repository metadata");
    try {
      const all = await api(`/orgs/${ORG}/repos?type=public&sort=pushed&per_page=100`);
      state.repos = all.filter(repo => !EXCLUDED.has(repo.name) && !repo.archived);
      state.lastFetch = new Date();

      const publicIssues = state.repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);
      const latest = [...state.repos].sort((a,b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];

      let releaseCount = 0;
      const releaseLookups = state.repos.slice(0, 12).map(async (repo) => {
        try {
          const releases = await api(`/repos/${ORG}/${encodeURIComponent(repo.name)}/releases?per_page=20`);
          return releases.length;
        } catch {
          return 0;
        }
      });
      releaseCount = (await Promise.all(releaseLookups)).reduce((a,b) => a+b,0);
      state.releases = releaseCount;

      els.repos.textContent = String(state.repos.length);
      els.issues.textContent = String(publicIssues);
      els.releases.textContent = String(releaseCount);
      els.push.textContent = latest ? fmtDate(latest.pushed_at) : "—";
      els.pushRepo.textContent = latest ? latest.name : "No public repositories";
      els.apiState.textContent = "PUBLIC TELEMETRY ONLINE";
      addTerminal("GITHUB",`Loaded ${state.repos.length} public project repos; ${publicIssues} open issues; ${releaseCount} release records`);
      renderProjects();
    } catch (error) {
      els.apiState.textContent = "PUBLIC TELEMETRY UNAVAILABLE";
      for (const el of [els.repos,els.push,els.issues,els.releases]) if (el) el.textContent = "N/A";
      els.pushRepo.textContent = "Static content remains available";
      addTerminal("WARN",error.message || "Public GitHub telemetry unavailable");
      renderFallback();
    }
  }

  function languageLabel(repo) {
    return repo.language || "Multi-language / unspecified";
  }

  function renderProjects() {
    const query = (els.search?.value || "").trim().toLowerCase();
    const repos = state.repos.filter(repo => {
      const hay = [repo.name, repo.description, repo.language, ...(repo.topics || [])].filter(Boolean).join(" ").toLowerCase();
      return !query || hay.includes(query);
    });

    if (!repos.length) {
      els.projectGrid.innerHTML = `<article class="project-skeleton">${query ? "No public repositories match this filter." : "No public project repositories are currently discoverable."}</article>`;
      return;
    }

    els.projectGrid.innerHTML = repos.map(repo => `
      <a class="project-card" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
        <div class="project-meta">
          <span>PUBLIC</span>
          <span>${escapeHtml(languageLabel(repo))}</span>
          ${repo.archived ? "<span>ARCHIVED</span>" : "<span>ACTIVE REPOSITORY</span>"}
        </div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(repo.description || "Public DPN Technology source repository. Open GitHub for repository-specific scope, documentation and maturity evidence.")}</p>
        <div class="project-meta">
          <span>PUSH ${escapeHtml(fmtDate(repo.pushed_at))}</span>
          <span>ISSUES ${repo.open_issues_count || 0}</span>
          <span>SIZE ${Math.max(1, Math.round((repo.size || 0)/1024))} MB</span>
        </div>
        <div class="project-footer"><span>OPEN REPOSITORY</span><span>↗</span></div>
      </a>
    `).join("");
  }

  function renderFallback() {
    els.projectGrid.innerHTML = `
      <a class="project-card" href="https://github.com/DPN-Technology" target="_blank" rel="noreferrer">
        <div class="project-meta"><span>PUBLIC DISCOVERY</span><span>GITHUB</span></div>
        <h3>DPN Technology Public Repositories</h3>
        <p>Live API telemetry could not be loaded. Open the DPN Technology organization directly to inspect currently public repositories.</p>
        <div class="project-footer"><span>OPEN ORGANIZATION</span><span>↗</span></div>
      </a>`;
  }

  function setupBinaryRain() {
    const canvas = $("binary-rain");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 0, height = 0, columns = 0, drops = [];
    const fontSize = 16;
    const chars = ["0","1","0","1","1","0","0","1"];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      columns = Math.ceil(width / fontSize);
      drops = Array.from({length:columns}, () => Math.random() * -40);
    }

    function frame() {
      ctx.fillStyle = "rgba(2,3,4,0.085)";
      ctx.fillRect(0,0,width,height);
      ctx.font = `${fontSize}px Consolas, monospace`;
      for (let i=0;i<drops.length;i++) {
        const char = chars[(Math.random()*chars.length)|0];
        const bright = Math.random() > .94;
        ctx.fillStyle = bright ? "rgba(255,45,62,.48)" : "rgba(229,9,20,.19)";
        ctx.fillText(char,i*fontSize,drops[i]*fontSize);
        if (drops[i]*fontSize > height && Math.random() > .975) drops[i] = -Math.random()*25;
        drops[i] += .43 + Math.random()*.22;
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize",resize,{passive:true});
    frame();
  }

  function setupLightning() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bolts = [...document.querySelectorAll(".bolt")];
    const flash = () => {
      if (!bolts.length) return;
      const bolt = bolts[(Math.random()*bolts.length)|0];
      bolt.animate([
        {opacity:.04,filter:"drop-shadow(0 0 2px rgba(255,38,55,.25))"},
        {opacity:.72,filter:"drop-shadow(0 0 18px rgba(255,38,55,.9))",offset:.15},
        {opacity:.12,offset:.28},
        {opacity:.5,offset:.42},
        {opacity:.12}
      ],{duration:320,easing:"linear"});
      setTimeout(flash, 3500 + Math.random()*7000);
    };
    setTimeout(flash,1800);
  }

  function setupEvents() {
    els.search?.addEventListener("input",renderProjects);
    els.refresh?.addEventListener("click",loadTelemetry);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", () => {
      const id = a.getAttribute("href").slice(1);
      if (id) addTerminal("NAV",`Opening public section: ${id}`);
    }));
  }

  setupEvents();
  setupBinaryRain();
  setupLightning();
  loadTelemetry();
})();