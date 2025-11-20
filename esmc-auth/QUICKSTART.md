# ESMC MCP - Quick Start ⚡

## Claude Desktop (5 minutes)

```bash
# 1. Install
npm install -g @esmc/mcp-server

# 2. Configure
# Edit: %APPDATA%\Claude\claude_desktop_config.json (Windows)
#       ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
{
  "mcpServers": {
    "esmc": {
      "command": "esmc-mcp"
    }
  }
}

# 3. Restart Claude Desktop

# 4. Login (in Claude chat)
Use esmc login with email: your@email.com and password: yourpassword

# 5. Verify
esmc status
```

---

## Claude Code Extension (5 minutes)

```bash
# 1. Install
npm install -g @esmc/mcp-server

# 2. Configure
# Create .vscode/mcp.json in project root:
{
  "mcpServers": {
    "esmc": {
      "command": "esmc-mcp"
    }
  }
}

# 3. Reload IDE
# Press: Ctrl+Shift+P → "Reload Window"

# 4. Login (in Claude Code panel)
esmc login --email your@email.com --password yourpassword

# 5. Verify
esmc status
```

---

## Troubleshooting

**Command not found?**
```bash
npm config get prefix
# Add that path to your system PATH
```

**Config not working?**
- Check JSON syntax at jsonlint.com
- Fully restart Claude/IDE (not just reload)
- Check logs in Developer Tools console

**Need help?** See full [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## What's Next?

- **Upgrade tier:** [esmc-sdk.com/pricing](https://esmc-sdk.com/pricing)
- **Documentation:** [esmc-sdk.com/docs](https://esmc-sdk.com/docs)
- **Support:** support@esmc-sdk.com
