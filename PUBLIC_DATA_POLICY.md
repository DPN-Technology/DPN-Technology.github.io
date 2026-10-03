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


### Public repository evidence

The Command Center may request the public Git tree for a discovered public repository in order to identify whether common engineering artifacts are present.

The scanner looks only at public file paths and does not read private repository content.

Discoverable artifact categories include:

- README;
- security policy;
- license / third-party notice;
- architecture documentation.

Artifact presence is presented as repository evidence, not a quality score.


### Browser evidence cache

To reduce repeated unauthenticated GitHub API requests, the Command Center may store recently discovered public artifact-path evidence in the visitor's browser for up to 10 minutes.

The cache contains only public repository evidence already returned by GitHub, is keyed to public repository push metadata, and is not transmitted to DPN Technology by the static Command Center.
