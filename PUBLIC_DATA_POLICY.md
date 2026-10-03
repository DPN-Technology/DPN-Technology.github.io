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


## v2.8 browser state and deep links

The Command Center may store the selected visual performance mode in the visitor's browser using local storage.

The existing short-lived public repository evidence cache remains limited to public evidence returned by GitHub.

v2.8 deep links may place the following public identifiers in the page URL:

- a visual-evidence slug;
- a public repository name;
- a public release repository/tag identifier;
- a public architecture-domain identifier;
- a public Fusion Mesh registry-node identifier.

No private repository identifier, credential, account token, internal infrastructure name or private telemetry is intentionally written into these deep links.

## Offline cache

The v2.8 service worker may cache same-origin static presentation files such as HTML, CSS, JavaScript, the DPN logo and visual evidence assets after they are requested.

The service worker does not turn GitHub API data into a claimed live offline state. If public API data cannot be refreshed, the Command Center's existing unavailable/fallback labels remain authoritative.


## v2.9 provenance disclosure

Exact source-file provenance links are shown only for visual evidence where the corresponding public repository paths were verified.

These links may expose:

- the already-public repository name;
- the already-public default branch;
- an already-public source path.

They do not intentionally expose private repositories, internal infrastructure inventory, credentials, private telemetry or customer data.

## Browser connectivity and presentation state

The online/offline indicator represents the visitor browser's network state only. It must not be interpreted as DPN service health.

Presentation mode is local UI state and does not grant additional data access.


## v3.0 verification-board boundaries

The Product Verification Board uses only intentionally public repository metadata and Command Center evidence mappings.

An actual capture means that a captured project/output image is present. It does not establish:

- production deployment;
- application uptime;
- security posture;
- customer use;
- release readiness;
- full runtime verification.

A source-derived visual means that the interface structure was derived from inspected public source. It does not establish execution.

A missing visual or repository artifact means it was not discovered in the current bounded public view. It does not prove that no such artifact exists elsewhere.


## v3.1 capture-factory data rules

Capture automation must use isolated local/runner state unless a future policy explicitly authorizes another source.

Current capture factories must not ingest private production records for the purpose of generating public screenshots.

Where representative data is needed, it must be:

- repository-defined seed data; or
- explicitly synthetic capture-only data.

The runtime manifest must disclose that boundary.

Ephemeral capture credentials are not public evidence and must not be committed to the repository, embedded in screenshots, included in manifests or printed in logs after generation.

A discovered capture workflow/harness is automation evidence only. The Command Center must not translate it into a runtime-capture claim until an actual captured artifact is available.
