# DPN Technology GitHub Command Center

> **Develop. Pioneer. Navigate.**

This repository is the source for the public **DPN Technology GitHub Command Center** organization site.

**Site:** https://dpn-technology.github.io/

## What this is

A dependency-free public engineering interface for DPN Technology featuring:

- animated DPN binary rain;
- red lightning and command-grid visuals;
- radar/topology command surfaces;
- live public GitHub telemetry;
- public repository discovery;
- company and leadership information;
- Architecture Atlas;
- Trust Center;
- engineering standards;
- maturity and evidence models;
- reliability and recovery doctrine;
- public engineering direction.

## Architecture

The site intentionally has **no framework and no application build step**.

```text
index.html
styles.css
app.js
favicon.svg
site.webmanifest
robots.txt
sitemap.xml
404.html
.nojekyll
```

The browser fetches public GitHub repository metadata directly from GitHub's public API. If API access is unavailable or rate-limited, static company, architecture, trust and standards content remains available.

## Privacy boundary

This site is intentionally public-only.

It does **not** enumerate:

- private DPN repository names;
- internal infrastructure;
- credentials or secrets;
- private endpoints;
- internal customer/employee information;
- private operational telemetry.

Public GitHub telemetry is not presented as organization-wide production health.

## Engineering source

Organization engineering standards, governance, security policy and reusable templates live in:

https://github.com/DPN-Technology/.github

## Deployment

This is an organization GitHub Pages repository. Publish from:

- **Branch:** `main`
- **Folder:** `/(root)`

The included `.nojekyll` file tells GitHub Pages to serve the static source directly.

## Visual system

The site follows the DPN Technology visual language:

**deep black surfaces · DPN red · raining 1s/0s · red lightning · radar/topology · command-console depth**

The visual layer should never imply runtime state, maturity, security certification or deployment status that the underlying evidence does not support.
