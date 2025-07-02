# Authentik MCP Examples

This directory contains example scripts and configurations for using the Authentik MCP servers.

## Files

### setup_claude_desktop.py
Python script that creates a Claude Desktop configuration for the Authentik MCP servers.

**Usage:**
```bash
python setup_claude_desktop.py
```

This will:
- Create or update your Claude Desktop configuration
- Add both full and diagnostic Authentik MCP servers
- Provide usage examples and next steps

### setup_nodejs.js
Node.js script that demonstrates Node.js package usage and Claude Desktop configuration.

**Usage:**
```bash
node setup_nodejs.js
```

This will:
- Create Claude Desktop configuration for Node.js packages
- Show example package.json configuration
- Provide TypeScript usage examples

## Quick Start

### For Python Users

1. Install the packages:
   ```bash
   pip install authentik-mcp authentik-diag-mcp
   # or with uv:
   uvx authentik-mcp
   uvx authentik-diag-mcp
   ```

2. Run the setup script:
   ```bash
   python examples/setup_claude_desktop.py
   ```

3. Edit the generated configuration file with your Authentik details

4. Restart Claude Desktop

### For Node.js Users

1. Install the packages:
   ```bash
   npm install -g authentik-mcp authentik-diag-mcp
   # or use npx directly:
   npx authentik-mcp
   npx authentik-diag-mcp
   ```

2. Run the setup script:
   ```bash
   node examples/setup_nodejs.js
   ```

3. Edit the generated configuration file with your Authentik details

4. Restart Claude Desktop

## Configuration

### Environment Variables

Both Python and Node.js packages support these environment variables:

- `AUTHENTIK_BASE_URL`: Your Authentik instance URL (required)
- `AUTHENTIK_TOKEN`: API token for authentication (required)
- `AUTHENTIK_TIMEOUT`: Request timeout in seconds/milliseconds (optional)
- `AUTHENTIK_DEBUG`: Enable debug logging (optional)
- `AUTHENTIK_USER_AGENT`: Custom user agent string (optional)

### Claude Desktop Configuration

The configuration files will be created in:
- **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

## Example Claude Prompts

Once configured, you can use prompts like:

### User Management
- "Show me all users in Authentik"
- "Create a new user with email john@example.com"
- "Find inactive users from the last 30 days"

### Security & Events
- "Show recent failed login attempts"
- "Generate a security report for last week"
- "Find users with administrative privileges"

### System Information
- "Check Authentik system health"
- "Show configured applications and their settings"
- "Generate a compliance report"

## Troubleshooting

### Common Issues

1. **"No tools available"**
   - Check your configuration file syntax
   - Verify environment variables are set correctly
   - Restart Claude Desktop after configuration changes

2. **"Authentication failed"**
   - Verify your API token is correct and active
   - Check that the token has required permissions
   - Ensure the base URL is correct (including https://)

3. **"Connection timeout"**
   - Check network connectivity to your Authentik instance
   - Verify firewall settings
   - Increase timeout values if needed

### Debug Mode

Enable debug logging by setting:
- Python: `AUTHENTIK_DEBUG=true`
- Node.js: `AUTHENTIK_DEBUG=true`

This will provide detailed logging to help diagnose issues.

## Getting Help

- Check the main README.md for more information
- Review USAGE.md for detailed usage instructions
- Create an issue on GitHub for bugs or feature requests
