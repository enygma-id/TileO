# TileO Security Policy

## Reporting a vulnerability

Do **not** report suspected vulnerabilities through a public GitHub issue, public discussion, pull request description, or other public channel.

Use [GitHub Private Vulnerability Reporting](https://github.com/enygma-id/TileO/security/advisories/new) when the reporting form is available. The [repository security page](https://github.com/enygma-id/TileO/security) lists published advisories and the current reporting policy. If private reporting is disabled, contact PT Enygma Solusi Negeri through an established private business channel and clearly mark the report as security-sensitive. Never move exploit details to a public issue as a fallback.

See [GitHub's instructions for privately reporting vulnerabilities](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/privately-reporting-a-security-vulnerability) for the reporting process, and [security maintenance](docs/SECURITY_MAINTENANCE.md) for automated checks and maintainer configuration.

Do not include secrets in an initial public message.

## What to include

A useful private report should include:

- affected version, commit, or deployment configuration;
- component or endpoint involved;
- reproduction steps or a minimal proof of concept;
- expected and observed behavior;
- security impact;
- whether exploitation requires authentication or network position; and
- suggested remediation if known.

## Sensitive information

Never publish:

- access keys or secret keys;
- cloud session tokens;
- signed or presigned storage URLs that are still valid;
- private keys;
- production credentials;
- internal customer datasets;
- sensitive infrastructure topology; or
- exploit details before coordinated disclosure is complete.

## Response process

The Project Steward or designated security maintainers may:

1. acknowledge the report privately;
2. reproduce and assess impact;
3. prepare a fix in a restricted branch or private fork when necessary;
4. coordinate release timing;
5. request a CVE where appropriate; and
6. publish a security advisory after a reasonable remediation window.

## Supported versions

Supported versions and security-fix windows are defined by published release notices, not assumed from repository visibility. Where no supported release is explicitly designated, contact maintainers privately before assuming security maintenance. Users should not assume every historical release receives fixes.

## Good-faith research

Good-faith security research is welcome when it avoids privacy harm, data destruction, service disruption, credential misuse, unauthorized persistence, or unnecessary access to third-party systems.
