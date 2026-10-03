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
