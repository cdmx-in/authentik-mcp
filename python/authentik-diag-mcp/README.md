# Authentik Diagnostic MCP Server

A Model Context Protocol (MCP) server that provides read-only diagnostic and monitoring capabilities for Authentik instances. This server is designed specifically for monitoring, troubleshooting, and gaining insights into your Authentik deployment without making any modifications.

## Features

### Event Monitoring & Audit Logs
- Comprehensive event tracking and audit trail analysis
- Real-time monitoring of authentication events
- Event filtering and search capabilities
- Historical event analysis for troubleshooting

### User Information (Read-Only)
- User account status monitoring
- User activity tracking
- Group membership analysis
- Authentication history review

### System Health Monitoring
- System configuration review
- Version and build information
- Health status checks
- Configuration drift detection

### Application Status Monitoring
- Application availability monitoring
- Provider status tracking
- Flow execution monitoring
- Integration health checks

### Diagnostic Capabilities
- Issue identification and analysis
- Performance monitoring
- Security event analysis
- Compliance reporting

## MCP Integration

This server is designed to be used with MCP-compatible tools and platforms. It provides a standardized interface for monitoring and diagnosing Authentik instances through the Model Context Protocol.

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

### Command Line
```bash
authentik-diag-mcp --base-url https://your-authentik-instance.com --token your-readonly-token
```

### Configuration Options
- `--base-url`: Base URL of your Authentik instance (required)
- `--token`: Authentik API token with read permissions (required)
- `--no-verify-ssl`: Disable SSL certificate verification

### Environment Variables
```bash
export AUTHENTIK_BASE_URL=https://your-authentik-instance.com
export AUTHENTIK_TOKEN=your-readonly-token
```

## API Token Setup

For diagnostic purposes, create a token with minimal read-only permissions:

1. Log in to your Authentik instance as an administrator
2. Navigate to **Directory** > **Tokens**
3. Click **Create** to create a new token
4. Set **Intent** to "API" 
5. Choose minimal read permissions (no write/delete permissions needed)
6. Copy the generated token for use with this diagnostic server

## Available Diagnostic Tools

### Event Monitoring
- `authentik_list_events` - List system events with advanced filtering
- `authentik_get_event` - Get detailed event information
- `authentik_search_events` - Search events by context and criteria
- `authentik_get_user_events` - Get events for specific users

### User Information (Read-Only)
- `authentik_get_user_info` - Get user information for diagnostics
- `authentik_list_users_info` - List users with basic information
- `authentik_get_user_events` - Analyze user-specific events

### Group Information (Read-Only)
- `authentik_get_group_info` - Get group information for diagnostics
- `authentik_list_groups_info` - List groups with membership details
- `authentik_get_group_members` - Analyze group membership

### Application Status (Read-Only)
- `authentik_get_application_status` - Check application health
- `authentik_list_applications_status` - Monitor all applications

### Flow Status (Read-Only)
- `authentik_get_flow_status` - Check flow execution status
- `authentik_list_flows_status` - Monitor all authentication flows

### System Health
- `authentik_get_system_config` - Review system configuration
- `authentik_get_version_info` - Get version and build information

### Provider Status (Read-Only)
- `authentik_list_providers_status` - Monitor provider health
- `authentik_get_provider_status` - Check specific provider status

## Resources

Access to read-only diagnostic resources:
- `authentik://events` - Event monitoring and audit logs
- `authentik://users/info` - User information for diagnostics
- `authentik://groups/info` - Group information for diagnostics
- `authentik://applications/status` - Application status monitoring
- `authentik://flows/status` - Flow status monitoring
- `authentik://system/health` - System health information

## Example Usage

```python
# Monitor recent authentication events
events = await authentik_list_events({
    "action": "login",
    "ordering": "-created",
    "page_size": 20
})

# Check user account status
user_info = await authentik_get_user_info({"user_id": 123})

# Analyze failed login attempts
failed_logins = await authentik_search_events({
    "search": "failed",
    "action": "login_failed"
})

# Get system health information
system_config = await authentik_get_system_config()

# Monitor application status
app_status = await authentik_list_applications_status()
```

## Monitoring Use Cases

### Security Monitoring
- Track failed authentication attempts
- Monitor suspicious login patterns
- Analyze access violations
- Review privilege escalations

### Performance Analysis
- Identify slow authentication flows
- Monitor API response times
- Analyze user experience metrics
- Track system performance trends

### Compliance Reporting
- Generate audit reports
- Track user access patterns
- Monitor data access events
- Compliance verification

### Troubleshooting
- Diagnose authentication issues
- Identify configuration problems
- Analyze user experience issues
- Debug integration problems

## Security Features

### Read-Only Design
- No write operations supported
- Safe for production monitoring
- Minimal permissions required
- No data modification risk

### Audit Trail
- All diagnostic queries are logged
- Tracking of monitoring activities
- Compliance with audit requirements
- Transparent operation logging

## Best Practices

### Token Management
- Use dedicated read-only tokens
- Rotate tokens regularly
- Monitor token usage
- Restrict token scope

### Monitoring Strategy
- Regular health checks
- Automated alerting
- Trend analysis
- Proactive monitoring

### Security
- Always use HTTPS
- Verify SSL certificates
- Monitor access logs
- Implement rate limiting

## MCP Integration & Usage

This server is designed to be managed by MCP-compatible tools and platforms. It provides a standardized interface for monitoring and diagnosing Authentik instances through the Model Context Protocol.

### Example Configurations

**VS Code / GitHub Copilot Workspace (settings.json):**
```jsonc
"mcp": {
  "servers": {
    "authentik-diag": {
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
    "authentik-diag": {
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

### Integration Notes
- Use `uvx authentik-diag-mcp` for Python versions as shown above
- For Node.js versions, use `npx @cdmx/authentik-diag-mcp` if you are using the Node.js implementation
- Replace `authentik-diag-mcp` with `authentik-mcp` for full API access if needed
- Let your MCP tool manage the environment and server lifecycle
- Direct CLI usage is not recommended for most users

## Requirements

- Python 3.10 or higher
- Valid Authentik API token with read permissions

## License

MIT License - see LICENSE file for details.

## Support

- [Authentik Documentation](https://docs.goauthentik.io/)
- [GitHub Issues](https://github.com/goauthentik/authentik-diag-mcp/issues)
- [Authentik Community](https://github.com/goauthentik/authentik/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.