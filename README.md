# Authentik MCP Servers

A collection of Model Context Protocol (MCP) servers for Authentik API integration, available in both Python and Node.js implementations.

## Overview

This repository contains four MCP servers for integrating with Authentik:

### Full-Featured Servers

- **authentik-mcp** (Python) - Complete Authentik API integration with full CRUD capabilities
- **authentik-mcp** (Node.js) - TypeScript implementation with complete API access

### Diagnostic-Only Servers

- **authentik-diag-mcp** (Python) - Read-only diagnostic and monitoring capabilities
- **authentik-diag-mcp** (Node.js) - TypeScript implementation for diagnostics and monitoring

## MCP Integration & Usage

This repository is designed for seamless integration with the Model Context Protocol (MCP) ecosystem. These servers are intended to be run and managed by MCP-compatible tools (such as VS Code extensions, automation platforms, or orchestration systems) rather than directly via the command line.

### How to Use with MCP

1. **Install the desired package(s):**
   - For full API access: `authentik-mcp`
   - For diagnostics/monitoring: `authentik-diag-mcp`
2. **Configure your MCP tool or platform** to point to the installed server binary (e.g., `authentik-mcp` or `authentik-diag-mcp`) and provide the required Authentik API token and base URL as arguments or environment variables.
3. **Do not run these servers directly via CLI.** Instead, let your MCP-compatible tool manage their lifecycle and communication.
4. **Interact with Authentik** through the MCP tool interface, which will expose all available resources and tools for automation, monitoring, and diagnostics.


#### Example: VS Code Github Copilot MCP Extension
**GitHub Copilot Workspace (settings.json):**
```jsonc
"mcp": {
  "servers": {
    "authentik": {
      "command": "uvx",
      "args": [
        "authentik-diag-mcp",
        "--base-url", "https://your-authentik-instance",
        "--token", "your-api-token"
      ]
    }
  }
}
```
**Claude Desktop (claude_desktop_config.json):**

```json
{
  "mcpServers": {
    "authentik": {
      "command": "uvx",
      "args": [
        "authentik-diag-mcp",
        "--base-url",
        "https://your-authentik-instance",
        "--token",
        "your-api-token"
      ]
    }
  }
}
```

- The `uvx` runner ensures the correct Python environment and dependencies are used.
- Replace `authentik-diag-mcp` with `authentik-mcp` for full API access if needed.
- No need to run or install via `pip` manually—let your MCP tool manage the environment.

## Quick Start

### Python Packages

> **Note:** These packages are not intended for direct CLI use. Integrate them with your MCP-compatible tool or platform as described above.

### Node.js Packages

> **Note:** These packages are not intended for direct CLI use. Integrate them with your MCP-compatible tool or platform as described above.

#### Full API Access

> Managed by your MCP tool. No direct CLI usage required.

#### Diagnostic Only

> Managed by your MCP tool. No direct CLI usage required.

## Features Comparison

| Feature                       | Full MCP | Diagnostic MCP |
| ----------------------------- | -------- | -------------- |
| User Management (CRUD)        | ✅       | ❌ (Read-only) |
| Group Management (CRUD)       | ✅       | ❌ (Read-only) |
| Application Management (CRUD) | ✅       | ❌ (Read-only) |
| Event Monitoring              | ✅       | ✅             |
| User Information              | ✅       | ✅ (Read-only) |
| Group Information             | ✅       | ✅ (Read-only) |
| Application Status            | ✅       | ✅ (Read-only) |
| Flow Management               | ✅       | ✅ (Read-only) |
| Provider Management           | ✅       | ✅ (Read-only) |
| Token Management              | ✅       | ❌             |
| System Health Monitoring      | ✅       | ✅             |
| Audit Trail Analysis          | ✅       | ✅             |

## API Token Setup

### For Full Access (authentik-mcp)

1. Log in to Authentik as an administrator
2. Navigate to **Directory** > **Tokens**
3. Create a new token with full API permissions
4. Copy the token for use with the full MCP server

### For Diagnostic Access (authentik-diag-mcp)

1. Log in to Authentik as an administrator
2. Navigate to **Directory** > **Tokens**
3. Create a new token with minimal read-only permissions
4. Copy the token for use with the diagnostic MCP server

## Available Tools

### Full MCP Server Tools

#### User Management

- `authentik_list_users` - List users with filtering
- `authentik_get_user` - Get user details
- `authentik_create_user` - Create new user
- `authentik_update_user` - Update existing user
- `authentik_delete_user` - Delete user

#### Group Management

- `authentik_list_groups` - List groups
- `authentik_get_group` - Get group details
- `authentik_create_group` - Create new group
- `authentik_update_group` - Update existing group
- `authentik_delete_group` - Delete group

#### Application Management

- `authentik_list_applications` - List applications
- `authentik_get_application` - Get application details
- `authentik_create_application` - Create new application
- `authentik_update_application` - Update existing application
- `authentik_delete_application` - Delete application

#### Event Monitoring

- `authentik_list_events` - List system events
- `authentik_get_event` - Get event details

#### Flow Management

- `authentik_list_flows` - List authentication flows
- `authentik_get_flow` - Get flow details

#### Provider Management

- `authentik_list_providers` - List providers
- `authentik_get_provider` - Get provider details

#### Token Management

- `authentik_list_tokens` - List API tokens
- `authentik_create_token` - Create new token

### Diagnostic MCP Server Tools

#### Event Monitoring

- `authentik_list_events` - List system events with filtering
- `authentik_get_event` - Get detailed event information
- `authentik_search_events` - Search events by criteria
- `authentik_get_user_events` - Get user-specific events

#### User Information (Read-Only)

- `authentik_get_user_info` - Get user information
- `authentik_list_users_info` - List users for diagnostics
- `authentik_get_user_events` - Get user event history

#### Group Information (Read-Only)

- `authentik_get_group_info` - Get group information
- `authentik_list_groups_info` - List groups for diagnostics
- `authentik_get_group_members` - Get group members

#### System Health

- `authentik_get_system_config` - Get system configuration
- `authentik_get_version_info` - Get version information

#### Application/Flow/Provider Status (Read-Only)

- `authentik_get_application_status` - Check application status
- `authentik_list_applications_status` - List application statuses
- `authentik_get_flow_status` - Check flow status
- `authentik_list_flows_status` - List flow statuses
- `authentik_get_provider_status` - Check provider status
- `authentik_list_providers_status` - List provider statuses

## Use Cases

### Full MCP Server

- **User Management**: Create, update, and manage user accounts
- **Group Administration**: Organize users into groups with appropriate permissions
- **Application Setup**: Configure and deploy new applications
- **Flow Configuration**: Set up and customize authentication flows
- **System Administration**: Complete system management and configuration

### Diagnostic MCP Server

- **Security Monitoring**: Track authentication events and security incidents
- **Performance Analysis**: Monitor system performance and user experience
- **Compliance Reporting**: Generate audit reports and compliance documentation
- **Troubleshooting**: Diagnose authentication and access issues
- **Health Monitoring**: Monitor system health and configuration drift

## Security Best Practices

### Token Management

- Use dedicated tokens for each server type
- Rotate tokens regularly
- Apply principle of least privilege
- Monitor token usage

### Environment Security

- Always use HTTPS in production
- Verify SSL certificates
- Use environment variables for sensitive data
- Implement proper access controls

### Monitoring

- Enable audit logging
- Monitor API usage patterns
- Set up alerting for suspicious activities
- Regular security reviews

## Development

### Building All Packages

```bash
chmod +x build.sh
./build.sh
```

### Publishing All Packages

```bash
chmod +x publish.sh
./publish.sh
```

### Development Setup

#### Python Development

```bash
cd python/authentik-mcp  # or authentik-diag-mcp
uv sync
uv run authentik-mcp --base-url http://localhost:9000 --token your-token
```

#### Node.js Development

```bash
cd nodejs/authentik-mcp  # or authentik-diag-mcp
npm install
npm run dev -- --base-url http://localhost:9000 --token your-token
```

## Requirements

### Python

- Python 3.8 or higher
- uv package manager (recommended)

### Node.js

- Node.js 18.0.0 or higher
- npm or yarn

## Project Structure

```
authentik-mcp/
├── python/
│   ├── authentik-mcp/           # Full Python MCP server
│   └── authentik-diag-mcp/      # Diagnostic Python MCP server
├── nodejs/
│   ├── authentik-mcp/           # Full Node.js MCP server
│   └── authentik-diag-mcp/      # Diagnostic Node.js MCP server
├── build.sh                     # Build all packages
├── publish.sh                   # Publish all packages
└── README.md                    # This file
```

## License

MIT License - see individual package LICENSE files for details.

## Support

- [Authentik Documentation](https://docs.goauthentik.io/)
- [GitHub Issues](https://github.com/goauthentik/authentik-mcp/issues)
- [Authentik Community](https://github.com/goauthentik/authentik/discussions)
- [MCP Documentation](https://modelcontextprotocol.io/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Changelog

See individual package CHANGELOG.md files for version history and changes.
