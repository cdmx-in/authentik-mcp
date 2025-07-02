# Authentik MCP Server

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

## Installation

### Using pip
```bash
pip install authentik-mcp
```

### Using uv
```bash
uv add authentik-mcp
```

## Usage

### Command Line
```bash
authentik-mcp --base-url https://your-authentik-instance.com --token your-api-token
```

### Configuration Options
- `--base-url`: Base URL of your Authentik instance (required)
- `--token`: Authentik API token (required)
- `--no-verify-ssl`: Disable SSL certificate verification

### Environment Variables
You can also set configuration via environment variables:
```bash
export AUTHENTIK_BASE_URL=https://your-authentik-instance.com
export AUTHENTIK_TOKEN=your-api-token
```

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

## Resources

The server provides access to the following resources:
- `authentik://users` - User management
- `authentik://groups` - Group management
- `authentik://applications` - Application management
- `authentik://events` - Event monitoring and audit logs
- `authentik://flows` - Authentication flows
- `authentik://providers` - Authentication providers

## Example Usage

```python
# List all users
users = await authentik_list_users()

# Create a new user
new_user = await authentik_create_user({
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "password": "secure-password"
})

# Get recent events
events = await authentik_list_events({
    "ordering": "-created",
    "page_size": 10
})

# Create a new group
group = await authentik_create_group({
    "name": "Developers",
    "is_superuser": False
})
```

## Security Considerations

- Always use HTTPS in production environments
- Rotate API tokens regularly
- Use least-privilege principle when creating tokens
- Monitor API usage through Authentik's audit logs
- Consider using separate tokens for different environments

## Development

### Local Development
```bash
git clone https://github.com/goauthentik/authentik-mcp
cd authentik-mcp/python/authentik-mcp
uv sync
uv run authentik-mcp --base-url http://localhost:9000 --token your-token
```

### Testing
```bash
uv run pytest
```

### Code Quality
```bash
uv run black src/
uv run isort src/
uv run ruff check src/
uv run mypy src/
```

## License

MIT License - see LICENSE file for details.

## Support

- [Authentik Documentation](https://docs.goauthentik.io/)
- [GitHub Issues](https://github.com/goauthentik/authentik-mcp/issues)
- [Authentik Community](https://github.com/goauthentik/authentik/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.