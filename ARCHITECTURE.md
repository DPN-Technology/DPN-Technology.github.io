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
- `release=<public repository>::<public tag>`.

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
