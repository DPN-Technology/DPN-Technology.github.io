# DPN Technology GitHub Command Center — Architecture

## System type

The Command Center is a static public web application.

It deliberately requires:

- no framework runtime;
- no npm install;
- no server;
- no database;
- no build process;
- no private GitHub token.

## Runtime

```text
Browser
  ├─ index.html
  ├─ styles.css
  ├─ app.js
  ├─ local static assets
  └─ GitHub public API
       ├─ public organization repositories
       └─ public repository releases
```

## Trust boundary

The browser is the runtime boundary.

The site does not receive credentials and does not call authenticated private APIs.

Public GitHub API responses are treated as external data and escaped before being inserted into HTML.

## Public telemetry

The site currently derives:

- public project repository count;
- latest public repository push;
- open issue totals;
- public release records;
- public star totals;
- public fork totals;
- primary language distribution;
- repository activity ordering.

The following repositories are intentionally excluded from public **project** discovery:

- `.github` — organization configuration / engineering hub;
- `DPN-Technology.github.io` — the Command Center itself.

This exclusion is about presentation. Both repositories remain public.

## Failure behavior

If the GitHub public API fails or becomes rate-limited:

- static company content remains available;
- architecture content remains available;
- Trust Center links remain available;
- engineering standards remain available;
- public telemetry is labeled unavailable;
- project discovery falls back to the organization page.

The page should not display stale data as current live state.

## Architecture drill-downs

The interactive system fabric is static organization doctrine, not runtime topology.

Nodes represent:

- Identity & Trust
- Observability & Evidence
- Automation
- Integration
- AI / Agents
- Recovery

Each node links to organization standards in `DPN-Technology/.github`.

## Security principles

- No secret or token storage.
- No private API calls.
- Escape public API strings before HTML insertion.
- Do not infer private repository existence.
- Do not present GitHub public metadata as production system health.
- Respect reduced-motion preferences.


## Public Fusion Mesh

The Fusion Mesh is a browser-generated registry visualization.

It includes:

- the DPN GitHub organization;
- the public organization engineering hub;
- the public GitHub Command Center;
- currently discoverable public project repositories.

The topology is a **relationship/discovery view**.

It must not be interpreted as:

- a network topology;
- service-to-service runtime connectivity;
- application uptime;
- production deployment;
- health monitoring;
- private repository inventory.

Repository nodes are generated only from GitHub public API metadata.

## Public event bus

The event bus combines public evidence records:

- repository push timestamps;
- public release records.

These are source-control events, not production events.

## Build journal

The public build journal merges recent public release records and public repository push activity into a chronological list.

It does not include private project work and does not imply a public launch when a repository changes.


## Public Engineering Evidence Matrix

The evidence matrix inspects public repository trees through the GitHub public API.

For each scanned public project repository, the browser looks for:

- root README documentation;
- `SECURITY.md` in the repository or a nested path;
- license / copying files or third-party license/notice files;
- architecture documentation;
- public release records already discovered by the release scanner;
- a public push within the last 30 days.

### Meaning

A discovered artifact means only that the artifact is present in the public repository tree.

It does **not** prove:

- security quality;
- test quality;
- runtime verification;
- production readiness;
- compliance;
- release verification.

An API failure is displayed as **unknown**, not **missing**.

### API budget

The scanner evaluates up to 20 public project repositories per scan to stay within reasonable unauthenticated GitHub API limits.

Discovered artifact paths and tree-result metadata may be retained in a 10-minute browser cache. Cache entries are keyed to repository name, default branch and public push timestamp, so a changed repository is rescanned instead of being treated as current from an older tree result.

A telemetry refresh resets the in-memory evidence map and rebuilds it from current public repository metadata. Unchanged repositories can reuse valid cached evidence; changed or expired entries require a fresh public tree request.

Cached and truncated-tree states are surfaced in the evidence matrix rather than hidden.


## v2.8 interaction architecture

v2.8 keeps the static browser-only runtime while adding richer client-side navigation and inspection.

```text
Browser
  ├─ index.html
  ├─ styles.v2.8.css
  ├─ app.v2.8.js
  ├─ service-worker.js
  ├─ same-origin static evidence assets
  └─ GitHub public API
       ├─ public repository metadata
       ├─ public release records
       └─ public repository trees (bounded evidence scan)
```

### Project dossiers

A project dossier is assembled client-side from public data already available to the Command Center:

- public repository metadata;
- current public push timestamp;
- public release records;
- repository evidence discovered by the bounded public tree scanner;
- visual evidence explicitly mapped to that public repository.

A dossier is not a maturity score and does not establish production deployment or runtime health.

### Visual evidence inspector

The evidence inspector uses local same-origin visual assets and the existing typed evidence vocabulary:

- actual capture;
- source-derived interface;
- project artwork.

The compare mode does not claim that two visuals represent the same runtime version unless that relationship is explicitly present in the underlying evidence.

### Deep links

The public UI supports query parameters for:

- `evidence=<public visual slug>`;
- `project=<public repository name>`;
- `release=<public repository>::<public tag>`;
- `arch=<public architecture domain>`;
- `mesh=<public registry node>`.

These values reference public-safe identifiers only.

### Product constellations

Constellations are navigation groupings inferred from visible product purpose and repository naming. They are not runtime dependency maps.

### Build lineage

Build lineage combines public push timestamps, public GitHub release records and mapped visual evidence. A push remains a source-control signal, not a production deployment event.

### Performance modes

- **Full** — complete visual storm.
- **Balanced** — reduced render cadence/effect intensity.
- **Low** — binary rain/lightning render work is skipped.

Reduced-motion preference defaults the visitor toward Low mode.

### PWA / offline behavior

The service worker caches same-origin static presentation resources. It does not cache or fabricate authenticated/private data. GitHub API calls remain network requests; when unavailable, existing static fallback behavior applies.


## v2.9 provenance model

Source-derived evidence may be associated with exact public source paths. A provenance mapping contains:

- the public DPN repository;
- one or more exact file paths used to derive the visual;
- a platform classification;
- a short provenance note.

The browser generates direct GitHub links using the repository's currently discovered public default branch.

A provenance mapping means that the visual structure was derived from those public source files. It does not prove the application executed successfully, that displayed placeholder concepts contain real data, or that the source is deployed to production.

### Platform filtering

Visual evidence is classified for browsing as Desktop, Web, Mobile, Game or Artwork. Platform classification is presentation metadata, not a runtime capability claim.

### Presentation mode

Presentation mode is a client-side guided navigation state. It changes navigation emphasis and visual intensity only; it does not change public data access or evidence semantics.

### Network state

The browser reports its own online/offline state. This is not DPN infrastructure health. Public GitHub telemetry remains separately sourced from the GitHub public API.


## v3.0 verification-board model

The Product Verification Board is computed in the browser from the same public-safe inputs already used by the Command Center:

- mapped visual evidence;
- exact visual provenance mappings;
- current public repository metadata;
- bounded public repository evidence scans;
- current public GitHub release records.

For each public repository, the board derives one visual-proof state:

- **actual capture present** — one or more mapped captured project/output images;
- **source visual only** — one or more source-derived visuals but no mapped captured image;
- **no mapped visual** — no Command Center visual currently mapped to that public repository.

These states are descriptive only. They are not maturity rankings.

### Next-proof field

The board may display a next public proof action based on missing evidence categories, for example:

- add a verified product visual;
- capture real runtime/output UI;
- replace remaining source-derived views;
- add a public release artifact;
- retry an unavailable repository evidence scan.

This field describes the next evidence gap. It is not an assessment of product quality or readiness.


## v3.1 capture-factory architecture

The Capture Factory is a repository-local evidence mechanism discovered by the public Command Center.

```text
public repository
  ├─ .github/workflows/ui-evidence-capture.yml
  ├─ tools/capture_ui_evidence.(mjs|py)
  └─ docs/evidence/runtime/
       ├─ manifest.json
       └─ *.png
```

### Discovery semantics

The public repo-tree scanner records three independent facts:

1. **capture factory installed** — both the standard workflow and capture harness are discoverable;
2. **runtime manifest committed** — `docs/evidence/runtime/manifest.json` is discoverable;
3. **actual visual mapped** — the Command Center currently maps one or more captured project/output visuals to that repository.

None of these facts implies production deployment or release readiness.

### Execution model

Current factories use `workflow_dispatch` only. They are intentionally not push-triggered.

Each capture job is expected to:

- create isolated runtime state;
- generate or use ephemeral capture-only credentials when authentication is required;
- avoid private production data;
- render the actual application;
- create PNG evidence;
- write a small manifest describing source commit, routes, viewport and data boundary;
- optionally commit only the evidence output.

### Safety boundaries

Network Mapper disables autopilot scanning during capture. Authenticated applications use runner-local credentials/state. Synthetic data must be labeled in the manifest and must not be presented as production data.


### Current standardized coverage

The public Capture Factory standard is currently installed in 12 product repositories:

- DPN One
- DPN Service Desk
- DPN Network Mapper
- DPN Operational Control
- DPN WatchTower
- DPN Workforce Time Management System
- DPN Aqua Labs Point of Sale System
- DPN Executive Control System
- DPN Human Resources Software
- DPN AI
- DPN OS
- DPN Death the Developer

Factory implementations differ where application architecture requires it, but all retain the same evidence boundary: isolated runner state, manual dispatch, explicit manifest caveats, and no promotion to runtime proof until capture artifacts exist.


### Native desktop capture path

Browser-first products use Playwright. Native desktop products use an isolated virtual X11 display and capture the actual application window rendered by the project's desktop toolkit.

DPN OS executes its PySide6/QML launchers with repository-native support files staged into the runner. Death the Developer instantiates its Tk application directly and switches real notebook tabs before capture. Neither path converts source markup into a simulated screenshot.

Authenticated capture is allowed only when the application can create isolated runner-local identities from ephemeral credentials. ECS uses this model: its generated CEO boot secret creates the fresh local CEO credential used by Playwright. The manifest must identify repository seed data and runner-local telemetry as non-production.
