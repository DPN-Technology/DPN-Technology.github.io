# DPN Technology GitHub Command Center — Changelog

## v2.7 — Visual Evidence Wall Expansion

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
