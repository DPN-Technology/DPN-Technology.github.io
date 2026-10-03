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
