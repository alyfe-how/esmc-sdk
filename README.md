<p align="center">
  <img src="https://esmc-sdk.com/logo.png" alt="ESMC Logo" width="120" />
</p>

<h1 align="center">ESMC SDK</h1>
<h3 align="center">Echelon Smart Mesh Core</h3>
<p align="center"><em>The Heart, Mind and Soul of Coding</em></p>

<p align="center">
  <a href="https://esmc-sdk.com"><img src="https://img.shields.io/badge/version-4.1-blue.svg" alt="Version 4.1"></a>
  <a href="https://esmc-sdk.com"><img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-green.svg" alt="Node.js >= 18"></a>
  <a href="https://discord.gg/N4qNFYWRwt"><img src="https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <a href="https://esmc-sdk.com">Website</a> •
  <a href="https://esmc-sdk.com/dashboard">Dashboard</a> •
  <a href="https://discord.gg/N4qNFYWRwt">Discord</a> •
  <a href="#quick-start">Quick Start</a>
</p>

---

## What is ESMC?

ESMC (Echelon Smart Mesh Core) is an AI-powered development framework that supercharges Claude Code with advanced intelligence capabilities:

- **5-Component Mesh Intelligence** - PIU, DKI, UIP, PCA, REASON working in parallel
- **Memory Systems** - ATLAS T1/T2/T3 + HYDRA for cross-session context
- **Strategic Orchestration** - ECHELON + ATHENA dialogue for complex tasks
- **7-Colonel Deployment** - Specialized AI agents for different task types
- **Proactive Intelligence** - Predicts what you need before you ask

## Quick Start

### Prerequisites

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/)
- [Claude Code Extension](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code)
- [Node.js 18+](https://nodejs.org/)
- ESMC Account ([Sign up free](https://esmc-sdk.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/esmc-sdk/esmc-sdk.git
cd esmc-sdk

# 2. Install dependencies
npm install

# 3. Authenticate (opens browser)
npm run login
```

### Setup in Your Project

Copy these to your project root:
- `.claude/` folder
- `CLAUDE.md` file

```bash
# Example
cp -r .claude /path/to/your/project/
cp CLAUDE.md /path/to/your/project/
```

### Verify Installation

In Claude Code terminal:
```bash
esmc status
```

You should see your tier (FREE/PRO/MAX/VIP) and subscription details.

## Usage

### Two Operational Modes

**Lightweight Mode (Default)**
- Fast, concise responses
- Intelligence runs silently in background
- Just code normally - ESMC enhances Claude automatically

**Full Deployment Mode**
- Type "ESMC" anywhere in your message
- Get detailed strategic briefing
- ECHELON + ATHENA dialogue
- 7-colonel deployment for complex tasks

### Example

```
# Lightweight (default)
"Fix the authentication bug in login.js"

# Full Deployment
"Use ESMC to fix the authentication bug in login.js"
```

## Features by Tier

| Feature | FREE | PRO | MAX | VIP |
|---------|------|-----|-----|-----|
| Mesh Intelligence | ✅ | ✅ | ✅ | ✅ |
| ATLAS T1 Memory | ✅ | ✅ | ✅ | ✅ |
| ATLAS T2/T3 | ❌ | ✅ | ✅ | ✅ |
| HYDRA Cross-Session | ❌ | ❌ | ✅ | ✅ |
| Context Inference Engine | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |

[Compare Plans](https://esmc-sdk.com/pricing)

## Architecture

```
ESMC SDK
├── .claude/                    # Intelligence framework
│   ├── ESMC-Chaos/            # Core components (5,171 modules)
│   │   └── components/        # Obfuscated for protection
│   └── memory/                # Session & context storage
├── esmc-auth/                 # Authentication module
├── scripts/                   # CLI utilities
├── CLAUDE.md                  # Activation trigger
└── package.json               # Dependencies
```

## Troubleshooting

### "esmc status" shows error or 0 files

File system cache issue. Quick fix:
```bash
ls -la .claude/
esmc status
```

### "Cannot find module 'node-machine-id'"

Install dependencies first:
```bash
npm install
npm run login
```

### ESMC not recognizing tier

```bash
# Check license exists
ls -la .claude/.esmc-license.json

# Re-authenticate if missing
npm run login

# Verify
esmc tier
```

### Features not activating

1. Ensure `CLAUDE.md` is in project root
2. Restart your IDE
3. ESMC activates when Claude Code reads `CLAUDE.md`

## Support

- **Website:** [esmc-sdk.com](https://esmc-sdk.com)
- **Dashboard:** [esmc-sdk.com/dashboard](https://esmc-sdk.com/dashboard)
- **Discord:** [discord.gg/N4qNFYWRwt](https://discord.gg/N4qNFYWRwt)
- **Email:** support@esmc-sdk.com

## License

ESMC SDK is proprietary software. Usage requires a valid license.

- **Free Tier:** Basic features, no cost
- **Paid Tiers:** PRO/MAX/VIP with advanced features

[View Pricing](https://esmc-sdk.com/pricing) | [Terms of Service](https://esmc-sdk.com/terms)

---

<p align="center">
  <strong>ESMC v4.1</strong> | Built with intelligence for developers who demand more
</p>

<p align="center">
  © 2025 ESMC. All rights reserved.
</p>
