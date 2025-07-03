# Authentik MCP Server (Node.js)

A Model Context Protocol (MCP) server that provides comprehensive integration with Authentik's API for user management, authentication flows, and system administration.

## Features

### User Management
- Create, read, update, and delete users
- Manage user groups and permissions
- User search and filtering capabilities

### Group Management
- Create and manage user groups
- Assign users to groups
- Group hierarchy management

### Application Management
- Manage Authentik applications
- Configure application providers
- Application deployment and configuration

### Authentication Flows
- View and manage authentication flows
- Flow configuration and customization
- Flow monitoring and diagnostics

### Event Monitoring
- System event tracking and audit logs
- Real-time event monitoring
- Event filtering and search capabilities

### System Administration
- API token management  
- Provider configuration
- System health monitoring
- Configuration management

## MCP Integration

This server is designed to be used with MCP-compatible tools and platforms. It provides a standardized interface for interacting with Authentik instances through the Model Context Protocol.

### Configuration

The server requires the following configuration parameters:
- `base-url`: Base URL of your Authentik instance (required)
- `token`: Authentik API token (required)
- `verify-ssl`: Enable/disable SSL certificate verification (optional, default: true)

### Environment Variables
You can also configure the server using environment variables:
- `AUTHENTIK_BASE_URL`: Base URL of your Authentik instance
- `AUTHENTIK_TOKEN`: Authentik API token
- `AUTHENTIK_VERIFY_SSL`: SSL certificate verification (true/false)

## API Token Setup

1. Log in to your Authentik instance as an administrator
2. Navigate to **Directory** > **Tokens**
3. Click **Create** to create a new token
4. Choose the appropriate permissions for your use case
5. Copy the generated token for use with this MCP server

## Available Tools

### User Management
- `authentik_list_users` - List all users with filtering options
- `authentik_get_user` - Get detailed user information
- `authentik_create_user` - Create new users
- `authentik_update_user` - Update existing users
- `authentik_delete_user` - Delete users

### Group Management
- `authentik_list_groups` - List all groups
- `authentik_get_group` - Get group details
- `authentik_create_group` - Create new groups
- `authentik_update_group` - Update existing groups
- `authentik_delete_group` - Delete groups

### Application Management
- `authentik_list_applications` - List all applications
- `authentik_get_application` - Get application details
- `authentik_create_application` - Create new applications
- `authentik_update_application` - Update existing applications
- `authentik_delete_application` - Delete applications

### Event Monitoring
- `authentik_list_events` - List system events and audit logs
- `authentik_get_event` - Get detailed event information

### Flow Management
- `authentik_list_flows` - List authentication flows
- `authentik_get_flow` - Get flow details

### Provider Management
- `authentik_list_providers` - List authentication providers
- `authentik_get_provider` - Get provider details

### Token Management
- `authentik_list_tokens` - List API tokens
- `authentik_create_token` - Create new API tokens

## MCP Integration & Usage

This server is designed to be managed by MCP-compatible tools and platforms. It provides a standardized interface for interacting with Authentik instances through the Model Context Protocol.

### Example Configurations

**VS Code / GitHub Copilot Workspace (settings.json):**
```jsonc
"mcp": {
  "servers": {
    "authentik": {
      "command": "npx",
      "args": [
        "@cdmx/authentik-mcp",
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
      "command": "npx",
      "args": [
        "@cdmx/authentik-mcp",
        "--base-url",
        "https://your-authentik-instance",
        "--token",
        "your-api-token"
      ]
    }
  }
}
```

### Integration Notes
- Use `npx @cdmx/authentik-mcp` for Node.js versions as shown above
- For Python versions, use `uvx authentik-mcp` if you are using the Python implementation
- Let your MCP tool manage the environment and server lifecycle
- Direct CLI usage is not recommended for most users

## Security Considerations

- Always use HTTPS in production environments
- Rotate API tokens regularly
- Use least-privilege principle when creating tokens
- Monitor API usage through Authentik's audit logs
- Consider using separate tokens for different environments

## Requirements

- Node.js 18.0.0 or higher
- Valid Authentik API token with appropriate permissions

## License

MIT License - see LICENSE file for details.

## Support

- [Authentik Documentation](https://docs.goauthentik.io/)
- [GitHub Issues](https://github.com/goauthentik/authentik-mcp/issues)
- [Authentik Community](https://github.com/goauthentik/authentik/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.