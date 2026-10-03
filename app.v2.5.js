(() => {
  "use strict";

  const ORG = "DPN-Technology";
  const API = "https://api.github.com";
  const EXCLUDED = new Set([".github", "DPN-Technology.github.io"]);

  const state = {
    repos: [],
    releases: [],
    lastFetch: null,
    languageCounts: new Map()
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
    launcher: $("command-launcher")
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

      const publicIssues = state.repos.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0);
      const totalStars = state.repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = state.repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
      const latest = [...state.repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
      const languages = computeLanguageCounts();

      state.releases = await fetchReleases(state.repos);

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
    } finally {
      if (els.refresh) els.refresh.disabled = false;
    }
  }

  function languageLabel(repo) {
    return repo.language || "Multi-language / unspecified";
  }

  function renderProjects() {
    if (!els.projectGrid) return;
    const query = (els.search?.value || "").trim().toLowerCase();
    const repos = state.repos.filter(repo => {
      const hay = [
        repo.name,
        repo.description,
        repo.language,
        ...(repo.topics || [])
      ].filter(Boolean).join(" ").toLowerCase();
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
          <span>ACTIVE REPOSITORY</span>
        </div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(repo.description || "Public DPN Technology source repository. Open GitHub for repository-specific scope, documentation and maturity evidence.")}</p>
        <div class="project-meta">
          <span>PUSH ${escapeHtml(fmtDate(repo.pushed_at))}</span>
          <span>ISSUES ${repo.open_issues_count || 0}</span>
          <span>SIZE ${Math.max(1, Math.round((repo.size || 0) / 1024))} MB</span>
        </div>
        <div class="project-stats">
          <span class="repo-stars">★ ${repo.stargazers_count || 0} STARS</span>
          <span class="repo-forks">⑂ ${repo.forks_count || 0} FORKS</span>
          <span>BRANCH ${escapeHtml(repo.default_branch || "main")}</span>
        </div>
        <div class="project-footer"><span>OPEN REPOSITORY</span><span>↗</span></div>
      </a>
    `).join("");
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

  function renderReleases() {
    if (!els.releaseFeed) return;
    const releases = state.releases.slice(0, 10);
    if (!releases.length) {
      els.releaseFeed.innerHTML = '<p class="feed-empty">No public GitHub release records are currently discoverable.</p>';
      return;
    }

    els.releaseFeed.innerHTML = releases.map(release => `
      <a class="release-item" href="${escapeHtml(release.url)}" target="_blank" rel="noreferrer">
        <span class="release-badge">${release.prerelease ? "PREVIEW" : "RELEASE"}</span>
        <div class="release-copy">
          <strong>${escapeHtml(release.repo)} // ${escapeHtml(release.tag)}</strong>
          <span>${escapeHtml(release.name)}</span>
        </div>
        <time datetime="${escapeHtml(release.published_at)}">${escapeHtml(fmtDate(release.published_at))}</time>
      </a>
    `).join("");
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

  function renderArchitecture(key) {
    const item = architecture[key];
    if (!item || !els.fabricDetail) return;

    document.querySelectorAll(".fabric-node").forEach(node => {
      node.classList.toggle("active", node.dataset.arch === key);
    });

    els.fabricDetail.innerHTML = `
      <p class="eyebrow">${escapeHtml(item.code)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <dl>
        <div><dt>CONTROL</dt><dd>${escapeHtml(item.control)}</dd></div>
        <div><dt>EVIDENCE</dt><dd>${escapeHtml(item.evidence)}</dd></div>
        <div><dt>RECOVERY</dt><dd>${escapeHtml(item.recovery)}</dd></div>
      </dl>
      <div class="arch-links">
        ${item.links.map(([label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`).join("")}
      </div>
    `;
    addTerminal("ARCH", `Loaded architecture node: ${item.title}`);
  }

  function setupArchitecture() {
    document.querySelectorAll(".fabric-node").forEach(node => {
      node.addEventListener("click", () => renderArchitecture(node.dataset.arch));
    });
    renderArchitecture("core");
  }

  function setupCommandPalette() {
    if (!els.palette || !els.launcher) return;
    const buttons = [...els.palette.querySelectorAll("[data-target]")];

    const open = () => {
      if (typeof els.palette.showModal === "function") els.palette.showModal();
      els.paletteSearch?.focus();
      addTerminal("CMD", "Command palette opened");
    };

    const closeAndGo = (target) => {
      els.palette.close();
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      addTerminal("NAV", `Command jump: ${target}`);
    };

    els.launcher.addEventListener("click", open);
    window.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (els.palette.open) els.palette.close();
        else open();
      }
    });

    buttons.forEach(button => button.addEventListener("click", () => closeAndGo(button.dataset.target)));

    els.paletteSearch?.addEventListener("input", () => {
      const q = els.paletteSearch.value.trim().toLowerCase();
      buttons.forEach(button => {
        button.hidden = Boolean(q) && !button.textContent.toLowerCase().includes(q);
      });
    });
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

    function frame(t) {
      rain(t);
      triggerLightning(t);
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(frame);
    addTerminal("VISUAL", "DPN Website-matched binary storm online");
  }

  function setupEvents() {
    els.search?.addEventListener("input", renderProjects);
    els.refresh?.addEventListener("click", loadTelemetry);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", () => {
        const id = anchor.getAttribute("href").slice(1);
        if (id) addTerminal("NAV", `Opening public section: ${id}`);
      });
    });
  }

  setupEvents();
  setupClock();
  setupArchitecture();
  setupCommandPalette();
  setupDpnStorm();
  loadTelemetry();
})();