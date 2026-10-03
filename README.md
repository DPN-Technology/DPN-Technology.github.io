# DPN Technology GitHub Command Center

Static, dependency-free source for the planned `DPN-Technology.github.io` organization site.

## Design goals

- unmistakable DPN black/red visual identity;
- animated binary rain and red lightning;
- radar/topology command-surface visuals;
- live **public-only** GitHub telemetry;
- company and leadership information;
- Architecture Atlas;
- public project discovery;
- Trust Center;
- engineering standards and templates;
- reliability, maturity, recovery and evidence models;
- responsive and accessible behavior;
- no framework, npm install or GitHub Actions build requirement.

## Runtime model

This is a static site:

```text
index.html
styles.css
app.js
```

It fetches public repository metadata directly from GitHub's unauthenticated public API. If GitHub rate limits or blocks the request, the page remains usable and labels telemetry as unavailable.

## Privacy boundary

The site does **not** enumerate private repository names or infer private organization activity.

## Publish target

Create a public repository named:

```text
DPN-Technology/DPN-Technology.github.io
```

Copy the contents of this `command-center/` directory into the repository root. GitHub Pages organization sites use that repository name as the public site source.

No GitHub Actions build is required by the site source itself.


## Visual evidence

The Command Center includes a typed visual evidence wall. Runtime/interface captures, source-derived UI views and project artwork are labeled separately so presentation does not overstate what has actually been executed or captured. Aqua Labs desktop views are currently source-derived from the current PySide6 UI code and are explicitly marked as non-runtime until real desktop screenshots can replace them.


### Ecosystem visual coverage

The visual evidence wall now also covers DPN OS, ECS, Workforce, HR and WatchTower. These additional views are derived from the applications' current UI source and remain explicitly labeled as non-runtime evidence wherever a genuine execution capture is not available.


### Visual evidence depth

The v2.7 gallery now carries 25 visual evidence items across actual captures, source-derived interfaces and project artwork. It includes deeper multi-screen coverage for Aqua Labs plus source-backed DPN AI, Network Mapper and Service Desk administration views. The registry includes both evidence-type filters and a project/screen search.

DPN Secure Chat and DPN Editor are intentionally not reconstructed without source: no accessible repository is currently available to verify those interfaces.


## v2.8 command experience

v2.8 turns the static public engineering surface into a deeper public command experience while keeping the same public-only trust boundary.

Major additions:

- full-screen visual evidence inspector with keyboard navigation;
- evidence pin/compare mode and shareable evidence deep links;
- public project dossiers assembled from current GitHub metadata, repository evidence and mapped visuals;
- inspectable public release records and shareable release links;
- product constellations for browsing the ecosystem by operating domain;
- public build lineage combining push signals, release records and mapped visual evidence;
- architecture drill-downs that point into related public product dossiers;
- Fusion Mesh node drill-downs with dossier/evidence access;
- expanded command palette indexing public projects and visual evidence;
- runtime-capture-share / capture-gap transparency controls;
- Full, Balanced and Low visual performance modes;
- mobile bottom command navigation;
- installable PWA behavior and offline caching of same-origin static presentation assets;
- structured organization metadata for search/social surfaces.

Deep-link query parameters reference public-safe identifiers only: `evidence`, `project`, and `release`.


## v2.9 provenance + presentation

v2.9 makes the public visual museum easier to verify and easier to present.

- source-derived visuals can expose exact public source-file provenance when a verified mapping exists;
- the evidence dashboard shows how many source-derived screens have exact source mappings;
- visual evidence can be filtered by both evidence type and platform (Desktop, Web, Mobile, Game, Artwork);
- the evidence inspector displays platform, source repository, exact source files and claim boundaries;
- browser titles/descriptions follow the currently opened evidence, dossier, release, architecture node or Fusion Mesh node;
- the top bar can share the current deep-linked view;
- browser online/offline state is visible;
- client presentation mode provides a guided ten-step tour through the Command Center;
- v2.9 offline caching points to the v2.9 application and stylesheet.

Exact provenance is intentionally added only where source paths were verified in the public repository tree.


## v3.0 evidence uplift

v3.0 adds a product-by-product verification layer on top of the existing evidence museum.

- the visual evidence museum now includes an actual Death the Developer browser-smoke verification capture;
- the public gallery contains 26 evidence items;
- the Product Verification Board combines mapped visual evidence, exact provenance, bounded repository evidence and public release records per public project;
- visual states are descriptive only: actual capture present, source visual only, or no mapped visual;
- the board exposes the next missing public proof artifact without turning evidence into a quality score;
- MemeSpace runtime visuals are now attributed to the public MemeSpace repository;
- exact provenance coverage includes both source-derived and runtime items when an exact public source path is mapped.

The verification board does not claim production readiness, security quality, deployment status or runtime health.


## v3.1 runtime capture factory

v3.1 adds public discovery of repo-native UI capture automation.

The standard factory consists of:

- `.github/workflows/ui-evidence-capture.yml`;
- `tools/capture_ui_evidence.mjs` or `tools/capture_ui_evidence.py`;
- optional committed `docs/evidence/runtime/manifest.json`;
- generated runtime PNG evidence under `docs/evidence/runtime/`.

The Command Center scans public repository trees for these exact artifacts. A factory being installed does **not** mean the workflow has run. A runtime manifest is displayed separately.

The first standardized wave currently covers DPN One, Service Desk, Network Mapper, Operational Control, WatchTower, Workforce and Aqua Labs.

The new Node-based factories are manual-dispatch only. They use isolated runner-local state and generate evidence manifests that document capture route, viewport, source commit and data-boundary caveats.
