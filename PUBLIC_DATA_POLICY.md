# DPN Technology Command Center — Public Data Policy

The Command Center is designed to display information that is already intentionally public.

## Data sources

### Static DPN content

Company, architecture, engineering and Trust Center content is maintained in this public repository and the public DPN organization engineering hub.

### GitHub public API

The site may request public metadata for DPN Technology repositories and public releases.

Examples include:

- repository name;
- description;
- primary language;
- public stars;
- public forks;
- open issue count;
- public push timestamp;
- public release tag and date.

## What is not requested

The site does not intentionally request or expose:

- private repositories;
- private repository names;
- credentials;
- access tokens;
- private issues;
- private releases;
- internal network state;
- customer data;
- employee data;
- private DPN operational telemetry.

## Telemetry wording

Public GitHub activity is **repository activity**, not proof of:

- application uptime;
- security health;
- production deployment;
- customer usage;
- operational readiness.

The interface should preserve that distinction.
