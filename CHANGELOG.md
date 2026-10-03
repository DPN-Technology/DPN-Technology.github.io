## v3.1 — Runtime Capture Factory

- Added public Capture Factory discovery to the Command Center.
- Public repo-tree evidence scans now detect the standard UI capture workflow, capture harness and committed runtime manifest independently.
- Added a Capture Factory dashboard showing installed factories, committed manifests, products with mapped actual visuals and repos not yet standardized.
- Added capture-workflow/harness/manifest links to public project dossiers when discovered.
- Added Capture Factory state to the Product Verification Board.
- Updated next-proof guidance to distinguish installing a factory, running a factory and promoting a committed runtime capture.
- Added manual-only repo-native Playwright capture factories to DPN One, Service Desk, Network Mapper, Operational Control, WatchTower and Workforce.
- Existing Aqua Labs Python capture automation is recognized by the same standard.
- Service Desk uses a generated ephemeral admin key and explicitly synthetic local capture ticket.
- Network Mapper capture disables autopilot/network scanning.
- Operational Control bootstraps a synthetic local identity in an isolated data directory.
- WatchTower uses runner-local first-run credentials without committing them.
- Workforce uses generated ephemeral admin/encryption credentials and an isolated local database.
- No factory is treated as runtime proof until an actual artifact/manifest exists.
- Updated the service-worker cache namespace and core files to v3.1.
- Capture factory wave two added DPN Executive Control System, DPN Human Resources Software and DPN AI.
- ECS captures the real secure-entry frontend from an isolated blank runtime with ephemeral secrets.
- HRIS follows the generated first-run login and forced password-change flow before capturing authenticated dashboard views.
- DPN AI starts with external/model/browser/desktop/voice capabilities disabled and captures the actual interface/degraded-state behavior.
- Standardized capture-factory coverage now spans 10 public product repositories.
- Verification after installation found no committed runtime manifests or standard runtime PNGs yet; runtime proof remains pending manual workflow execution.

## v3.0 — Evidence Uplift

- Added an actual Death the Developer browser-smoke verification capture from the public repository evidence folder.
- Increased the visual evidence museum from 25 to 26 items.
- Added the Product Verification Board with per-project visual proof state, exact provenance count, public release records and bounded repository evidence.
- Added verification-board search and proof-state filters.
- Added factual next-proof guidance such as capture runtime UI, replace source-derived views or add a public release artifact.
- Credited existing MemeSpace captures to the public MemeSpace repository for dossier/verification aggregation.
- Expanded exact provenance counting to include mapped runtime evidence.
- Added the verification board to the command palette and client presentation flow.
- Updated the service-worker cache namespace and core files to v3.0.
- Preserved the no-score rule: verification data is descriptive and does not rank product quality, security or readiness.

## v2.9 — Provenance + Presentation

- Added exact public source-file provenance for verified source-derived UI evidence.
- Added a provenance-mapped evidence metric.
- Added platform filtering: Desktop, Web, Mobile, Game and Artwork.
- Added platform information to the full-screen evidence inspector.
- Added dynamic browser title/description context for deep-linked public views.
- Added Share View behavior using the Web Share API with clipboard fallback.
- Added browser online/offline state and an offline-mode notice.
- Added guided client Presentation Mode with ten DPN Command Center stops.
- Added PageUp/PageDown navigation and Escape exit behavior for presentation mode.
- Added Twitter/Open Graph image alt metadata.
- Updated the service-worker cache namespace and core files for v2.9.
- Preserved all public-evidence truth boundaries; exact provenance is only shown when a public source path was verified.

## v2.8 — Public Command Experience

- Added full-screen visual evidence inspector with previous/next keyboard navigation.
- Added evidence pin/compare mode.
- Added shareable deep links for visual evidence, public project dossiers and public releases.
- Added repository-backed public project dossiers with current metadata, release records, inspected artifact paths and mapped visuals.
- Added inspectable release detail surfaces.
- Added product constellations for Control/Infrastructure, AI/Development, Retail/Aquarium, Workforce/Business, Platform/Identity and Interactive/Simulation navigation.
- Added public build-lineage cards combining public push signals, public GitHub releases and mapped visual evidence.
- Expanded Architecture Atlas drill-downs with related public product surfaces.
- Expanded Fusion Mesh node inspection with product family, mapped visuals, public releases and repository evidence context.
- Expanded command palette to index current public repositories and visual evidence.
- Added runtime-capture-share and capture/source-gap transparency metrics.
- Added Full, Balanced and Low visual modes; Low mode stops binary-rain/lightning rendering work.
- Added dedicated mobile command dock.
- Added PWA service worker and manifest shortcuts for core public command surfaces.
- Added Organization JSON-LD and richer application metadata.
- Preserved public-only trust boundaries: no private repositories, no fabricated runtime state, no claim that GitHub activity equals production deployment.

# DPN Technology GitHub Command Center — Changelog

## v2.7 — Visual Evidence Wall Expansion

- Added eight more source-derived application views:
  - DPN AI Desktop Command Center;
  - DPN Network Mapper Topology Workbench;
  - DPN Service Desk I.T. Ticket Queue;
  - DPN Aqua Labs Inventory;
  - DPN Aqua Labs Purchasing Command Center;
  - DPN Aqua Labs Maintenance Work Order Center;
  - DPN Aqua Labs End of Day Control Center;
  - DPN Aqua Labs AquaNode Tank Sensor Command Center.
- Visual evidence count now reaches 25 items in the Command Center source.
- Added project/screen search on top of evidence-type filters for faster browsing.
- DPN Secure Chat and DPN Editor remain evidence gaps because no accessible source repository is currently available to verify their interfaces.

- Expanded ecosystem UI coverage with five additional source-derived interface views:
  - DPN OS Control Center;
  - DPN Executive Control System Command Center;
  - DPN Workforce Executive Dashboards;
  - DPN HR Executive HR Dashboard;
  - DPN WatchTower Command Center.
- Backend-dependent metrics and personnel/security values are deliberately blank or marked as source view rather than fabricated.

- Added a visual-evidence registry with live counts for total visuals, actual captures, source-derived interfaces and artwork.
- Added interactive evidence filters so visitors can isolate actual captures from source-derived views instead of conflating evidence types.

- Expanded **Inside the Builds** into a typed visual evidence wall.
- Added three additional source-backed DPN application views:
  - DPN Operational Control Command Nexus source-derived interface view;
  - DPN One unified control-plane overview with explicit demo/placeholder-data warning;
  - Death the Developer desktop IDE/agent studio view.
- Added three DPN Aqua Labs desktop interface views derived from the current PySide6 source:
  - Store Command Center;
  - Register;
  - Terminal Command Center / Store Network.
- Kept source-derived views visibly labeled **not runtime capture**.
- Preserved existing actual Service Desk, Network Mapper, MemeSpace and Aqua mobile visual evidence.
- Added the MemeSpace Pinball actual game-output image already carried by the DPN Website source.
- Added an evidence legend separating:
  - actual captures;
  - source-derived interface views;
  - project artwork.
- Added evidence-context copy so demo values in source-derived views are not confused with production data.
- Added a repo-native Aqua Labs desktop capture harness and workflow for eventual runtime screenshot replacement.
- Runtime capture automation is currently blocked by unavailable private GitHub Actions runner capacity; the public Command Center does not hide that limitation.

## v2.7 — Public Engineering Evidence Matrix

- Added a live evidence matrix for currently public project repositories.
- Added public repository tree inspection for:
  - README presence;
  - security policy presence;
  - license or third-party notice presence;
  - architecture documentation presence.
- Merged repository-tree evidence with:
  - public GitHub release records;
  - recent public push activity.
- Added evidence summary counters.
- Added an explicit **present / not discovered** vocabulary instead of pass/fail scoring.
- Added API-error handling so an unavailable tree is shown as unknown instead of falsely absent.
- Limited tree scanning to public repositories discovered through the public organization API.
- Excluded `.github` and the Command Center repository from the project evidence matrix.
- Confirmed the first public project evidence row against `DPN-QB-FiveM-Scripts`.
- Retained exact discovered artifact paths and made README, security, license/notice, architecture and release evidence directly inspectable.
- Added a 10-minute browser evidence cache keyed to repository default branch and public push timestamp.
- Telemetry refresh now resets in-memory evidence before rescanning, while unchanged repositories can reuse valid cached public evidence.
- Added visible CACHE and PARTIAL TREE context so reused or truncated public tree results are not presented ambiguously.

## v2.6 — Public Fusion Mesh

- Added a public-safe DPN Fusion Mesh inspired by the DPN Website status center.
- Added a dynamic topology built from public GitHub repositories and organization surfaces.
- Added a node detail drawer with repository metadata.
- Added public event-bus output built from push and release records.
- Added registry statistics:
  - public mesh nodes;
  - release sources;
  - recently pushed public repositories;
  - public event records.
- Added project intelligence filters for:
  - recent pushes;
  - release records;
  - open issues;
  - public stars.
- Added a runtime-generated public build journal.
- Added a storm on/off control to the top command bar.
- Preserved the distinction between registry relationships and runtime integrations.
- The topology does not claim application uptime, private infrastructure, or live network connectivity.

## v2.5 — Cinematic DPN Build Surfaces

- Added Website-inspired perspective project windows to the hero.
- Added a large orbit-backed DPN logo composition behind real project imagery.
- Added a floating secondary project capture.
- Added a DPN public signal strip with live GitHub sync state.
- Added the **Inside the Builds** visual evidence gallery.
- Imported verified DPN project captures from the Website repository:
  - DPN Service Desk actual request interface;
  - DPN Network Mapper sample topology;
  - MemeSpace pool output from actual game code;
  - DPN Aqua Labs unpaired mobile interface;
  - Death the Developer project artwork.
- Added context labels to prevent project visuals from implying live infrastructure or production deployment.
- Added stronger red orbit section transitions and Website-style cinematic depth.
- Preserved the official DPN logo, CEO portrait, binary storm, branching lightning and public-only telemetry boundaries.

## v2.4 — DPN Leadership Presentation

- Imported the approved Aaron “Diesel” Sherk CEO portrait from the DPN Website repository.
- Added the portrait as a real public binary asset.
- Replaced the text-only leadership monogram with the approved image.
- Added DPN Website-inspired portrait framing, red edge treatment and company-logo badge.
- Preserved factual leadership copy and public/private boundaries.

## v2.3 — DPN Website Identity

- Imported the official `assets/dpn-logo.webp` from the DPN Website repository as a real public binary asset.
- Replaced text-only DPN brand orbs with the official logo in the top bar, radar core and footer.
- Added a logo-led hero brandline.
- Added a DPN Website-inspired discipline strip.
- Added a large company visual core with orbit rings, rotating sweep and official logo.
- Brought over the Website visual language:
  - black / deep charcoal surfaces;
  - `#ff1738` / `#ff334b` red accents;
  - orbit/radar framing;
  - command-surface depth;
  - company band hierarchy;
  - Develop / Pioneer / Navigate identity.
- Changed the site favicon and PWA icon to the official DPN logo.
- Preserved the v2.2 high-intensity binary storm and lightning engine.

## v2.1 — DPN Binary Storm

- Replaced the lighter Command Center background effect with the DPN Website storm architecture.
- Added a dedicated full-screen binary canvas.
- Added dense seven-character 1/0 trails with glowing leading digits.
- Added randomized per-column fall speed and phase.
- Added a dedicated procedural lightning canvas.
- Added branching red lightning bolts generated across the viewport.
- Added multi-pass glow rendering using the DPN Website red `#ff1738`.
- Added randomized lightning timing and impact position.
- Added brief red page flashes synchronized with lightning.
- Matched the DPN Website visual stacking model:
  - grid at base;
  - binary rain above the grid;
  - lightning above the rain;
  - flash above lightning;
  - command interface above the storm;
  - scanline layer above the interface.
- Preserved reduced-motion behavior.

## v2 — Interactive Public Engineering Surface

### Added

- Interactive DPN system fabric with drill-downs for:
  - Core
  - Identity & Trust
  - Observability & Evidence
  - Automation
  - Integration
  - AI / Agents
  - Recovery
- Public operations console.
- Recent public repository activity feed.
- Public language distribution.
- Aggregate public stars and forks.
- Release / evidence explorer.
- DPN verification vocabulary:
  - Source Verified
  - Build Verified
  - Runtime Verified
  - Release Verified
- Ctrl/Cmd+K command palette.
- Live command clock.
- Richer repository cards with stars, forks and default branch.
- Expanded public telemetry.
- Additional mobile and reduced-motion handling.

### Privacy

- The organization configuration repository is excluded from public project discovery.
- The Command Center repository itself is excluded from public project discovery.
- Private repository names are neither enumerated nor inferred.
- Telemetry continues to use public GitHub API data only.

## v1 — Command Center Foundation

- DPN black/red command interface.
- Animated binary rain.
- Red lightning.
- Radar / topology hero.
- Company Core and leadership.
- Architecture Atlas.
- Public GitHub repository discovery.
- Trust Center.
- Engineering standards hub.
- Public direction / roadmap.
- Static GitHub Pages production packaging.
