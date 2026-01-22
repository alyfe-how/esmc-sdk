# CHANGELOG

All notable changes to ESMC SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0] - 2026-01-22

### Major Architecture Upgrade - Intelligent Chunking & Platform-Enforced Protocols

Complete architecture synchronization achieving 40-60% token savings and platform-enforced protocol loading.

### Added

- ✅ Intelligent chunking system
- ✅ UserPromptSubmit hook (platform-enforced protocols)
- ✅ Cascading ATLAS memory
- ✅ 2 new CLI optimization tools
- ✅ FORTRESS MODE
- ✅ Token savings: 40-60%

### Changed

- Updated core manifests with intelligent routing
- Token optimization: 40-60% savings via conditional loading
- Enhanced memory system architecture

### Security

- FORTRESS MODE: Random sampling verification at login
- Zero exposure architecture
- License revocation on tampering detection
- Symmetric secret rotation on every build

### Build & Deployment

- Fully automated build pipeline
- Enhanced obfuscation and integrity validation
- Package output: `ESMC-SDK-Chaos-v5.0.0.zip` (2.2 MB)

### Performance Metrics

- Token savings: 40-60%
- Build time: ~2-5 minutes
- Package size: 2.2 MB

---

## [3.67.0] - 2025-11-06

### Security & Build Pipeline Validation

#### Added
- Symmetric secret rotation for Guardian blessing and checksum salt
- Feature 6 implementation in SUPERCHAOSv2 (automatic checksum updates)
- Bootstrap directory creation in build-production-chaos.js

#### Changed
- Updated all 4 core manifests to version 3.67.0 (BOOTSTRAP, BRAIN, COLONELS-CORE, REFERENCE)
- Vercel environment sync expanded from 5 to 7 variables
- Fixed honeypot decoys to write inside `.claude/` folder (0 decoys in SDK root)

#### Fixed
- Version synchronization across all manifests (resolved 3.58/3.54/3.51 drift)
- ENOENT error when writing system.md (added recursive directory creation)

---

## Initial Releases (Pre-Changelog)

Prior to version 3.67.0, ESMC SDK underwent extensive development including:
- Build pipeline sophistication (10-step production process)
- MCP-only architecture (removal of CLI/installer redundancy)
- 3-layer security (encryption + obfuscation + integrity)
- Adobe-style filename obfuscation
- Portable ZIP packaging model

For historical context, see `.claude/memory/sessions/2025-10-13-sdk-build-pipeline.json`

---

[5.0.0]: https://github.com/alyfe-how/esmc-sdk/releases/tag/v5.0.0
[3.67.0]: https://github.com/alyfe-how/esmc-sdk/releases/tag/v3.67.0
