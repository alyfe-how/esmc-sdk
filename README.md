=====================================
ESMC 5.0 | Echelon Smart Mesh Core
The Heart, Mind and Soul of Coding
===

## 🚀 QUICK START GUIDE (3 SIMPLE STEPS!)

**STEP 1: Download \& Extract to Your Project Directory**

📥 **Download ESMC (Choose ONE method):**

**Method A: GitHub Releases** (Public)
• Visit: https://github.com/alyfe-how/esmc-sdk/releases
• Download: ESMC-SDK-Chaos-v5.0.zip

**Method B: Dashboard** (After login)
• Visit: https://esmc-sdk.com/dashboard
• Sign in with your account
• Download latest version

📂 **Extract to Your Project:**
• Extract ALL contents of the downloaded ZIP
• Copy EVERYTHING into your project directory

Example:
```
Before:
YourProject/
  ├── src/
  └── package.json

After:
YourProject/
  ├── .claude/              ← Extracted here
  ├── esmc-auth/            ← Extracted here
  ├── scripts/              ← Extracted here
  ├── CLAUDE.md             ← Extracted here
  ├── package.json          ← Extracted here (ESMC's)
  ├── verify-package.js     ← Extracted here
  ├── src/                  ← Your existing files
  └── (your other files)    ← Your existing files
```

**STEP 2: Install \& Login**
Windows:
• Right-click on your project folder
• Select "Open in Terminal" or "Open PowerShell here"
• Run: npm install
• Run: npm run login

Mac/Linux:
• Open Terminal
• cd to your project directory
• Run: npm install
• Run: npm run login

Browser will open → Sign in → Done! ✅

**STEP 3: Verify \& Start Coding**
• Open project in Claude Code (VS Code/Cursor)
• In Claude Code terminal, test: esmc status
• Should show your tier and subscription ✅
• Start coding! ESMC activates automatically!

===========================================================================

## ⚠️ IMPORTANT: DO NOT SKIP STEPS

ESMC will NOT work if you skip dependency installation or authentication!

Common mistake: Trying to run "npm run login" before "npm install"
→ This causes "Cannot find module 'node-machine-id'" error

Correct order: Extract → Install Dependencies → Authenticate → Copy to Project

===========================================================================

## HOW IT WORKS

• Cursor/VS Code → Your IDE with Claude Code extension
• .claude/ → ESMC intelligence framework
• CLAUDE.md → Activation trigger for Claude Code

Just copy the 2 items (.claude, CLAUDE.md) to any project and code naturally.
ESMC enhances Claude Code with advanced intelligence capabilities.

===========================================================================

## TWO OPERATIONAL MODES

**Lightweight (Default):** Fast, concise responses. Intelligence runs silently
in the background to inform Claude's decisions.

**Full Deployment:** Type "ESMC" keyword anywhere in your message for detailed
strategic briefing with ECHELON + ATHENA dialogue, mesh intelligence consensus,
and 7-colonel deployment.

===========================================================================

## SYSTEM REQUIREMENTS

• VS Code or Cursor IDE
• Claude Code extension (install from marketplace)
• Node.js 18+ (https://nodejs.org)
• Internet connection (for authentication)

===========================================================================

## SUPPORT

• Website: https://esmc-sdk.com
• Dashboard: https://esmc-sdk.com/dashboard
• Discord: https://discord.gg/N4qNFYWRwt
• Email: support@esmc-sdk.com

===========================================================================

## TROUBLESHOOTING

**"esmc status" says "Error reading file" or "Found 0 files" (MOST COMMON!)**
→ File system caching issue. Quick fix:

1. Open Claude Code terminal
2. Run: ls -la .claude/
3. Try again: esmc status
4. Should work now! ✅

Why this happens: Windows/WSL sometimes doesn't immediately refresh
directory cache after creating .esmc-license.json. The 'ls' command
forces a refresh.

**"Cannot find module 'node-machine-id'"**
→ You skipped 'npm install'! Install dependencies BEFORE login:
• Run: npm install
• Then: npm run login

**"ESMC not recognizing my tier"**
→ Verify license file exists and is readable:

1. Check: ls -la .claude/.esmc-license.json
2. If missing: Run 'npm run login' again
3. Test: esmc tier (should show MAX/PRO/FREE)
4. Test: esmc status (should show full details)

**"Authentication failed" or "Network error"**
→ Check internet connection. Try: npm run login again.
If problem persists, check firewall settings.

**"ESMC features not activating"**
→ Ensure CLAUDE.md is in your project root.
Restart IDE after extracting files.
ESMC activates when Claude Code reads CLAUDE.md.

**"npm: command not found"**
→ Install Node.js 18+ from https://nodejs.org
Restart terminal after installation.

===========================================================================
ESMC v5.0 | 2026-01-22
© 2026 ESMC. All rights reserved.

# Compatible with VS Code + Claude Code | Cursor + Claude Code

