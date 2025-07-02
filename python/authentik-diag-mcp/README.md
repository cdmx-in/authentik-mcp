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

## Installation

### Using pip
```bash
pip install authentik-diag-mcp
```

### Using uv
```bash
uv add authentik-diag-mcp
```

## Usage

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

## Development

### Local Development
```bash
git clone https://github.com/goauthentik/authentik-diag-mcp
cd authentik-diag-mcp/python/authentik-diag-mcp
uv sync
uv run authentik-diag-mcp --base-url http://localhost:9000 --token your-token
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
- [GitHub Issues](https://github.com/goauthentik/authentik-diag-mcp/issues)
- [Authentik Community](https://github.com/goauthentik/authentik/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.