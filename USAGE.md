# Authentik MCP Servers - Usage Examples

## Quick Start Examples

### Python Usage

#### Full MCP Server
```bash
# Install
pip install authentik-mcp

# Run with command line arguments
authentik-mcp --base-url https://auth.company.com --token ak-token-xyz123

# Run with environment variables
export AUTHENTIK_BASE_URL=https://auth.company.com
export AUTHENTIK_TOKEN=ak-token-xyz123
authentik-mcp --base-url $AUTHENTIK_BASE_URL --token $AUTHENTIK_TOKEN
```

#### Diagnostic MCP Server
```bash
# Install
pip install authentik-diag-mcp

# Run with command line arguments
authentik-diag-mcp --base-url https://auth.company.com --token ak-readonly-token-xyz123

# Run with environment variables
export AUTHENTIK_BASE_URL=https://auth.company.com
export AUTHENTIK_TOKEN=ak-readonly-token-xyz123
authentik-diag-mcp --base-url $AUTHENTIK_BASE_URL --token $AUTHENTIK_TOKEN
```

### Node.js Usage

#### Full MCP Server
```bash
# Install globally
npm install -g authentik-mcp

# Run
authentik-mcp --base-url https://auth.company.com --token ak-token-xyz123

# Or use npx (recommended for testing)
npx authentik-mcp --base-url https://auth.company.com --token ak-token-xyz123
```

#### Diagnostic MCP Server
```bash
# Install globally
npm install -g authentik-diag-mcp

# Run
authentik-diag-mcp --base-url https://auth.company.com --token ak-readonly-token-xyz123

# Or use npx (recommended for testing)
npx authentik-diag-mcp --base-url https://auth.company.com --token ak-readonly-token-xyz123
```

## Configuration Examples

### MCP Client Configuration (Claude Desktop)

Add to your MCP configuration file:

```json
{
  "mcpServers": {
    "authentik": {
      "command": "authentik-mcp",
      "args": [
        "--base-url", "https://auth.company.com",
        "--token", "ak-token-xyz123"
      ]
    },
    "authentik-diagnostics": {
      "command": "authentik-diag-mcp", 
      "args": [
        "--base-url", "https://auth.company.com",
        "--token", "ak-readonly-token-xyz123"
      ]
    }
  }
}
```

### Environment-based Configuration

Create a `.env` file:
```env
AUTHENTIK_BASE_URL=https://auth.company.com
AUTHENTIK_TOKEN=ak-token-xyz123
AUTHENTIK_VERIFY_SSL=true
```

Then run:
```bash
# Python
authentik-mcp --base-url $AUTHENTIK_BASE_URL --token $AUTHENTIK_TOKEN

# Node.js
npx authentik-mcp --base-url $AUTHENTIK_BASE_URL --token $AUTHENTIK_TOKEN
```

## Common Use Cases

### User Management Automation

```python
# Example MCP client interaction for user management

# List all active users
users = await mcp_client.call_tool("authentik_list_users", {
    "is_active": True,
    "page_size": 50
})

# Create a new user
new_user = await mcp_client.call_tool("authentik_create_user", {
    "username": "john.doe",
    "email": "john.doe@company.com", 
    "name": "John Doe",
    "password": "TempPass123!",
    "is_active": True
})

# Add user to a group
await mcp_client.call_tool("authentik_update_user", {
    "user_id": new_user["pk"],
    "groups": [group_id]
})
```

### Security Monitoring

```python
# Example diagnostic monitoring

# Check recent authentication failures
failed_logins = await mcp_client.call_tool("authentik_list_events", {
    "action": "login_failed",
    "ordering": "-created",
    "page_size": 20
})

# Monitor specific user activity
user_events = await mcp_client.call_tool("authentik_get_user_events", {
    "username": "admin",
    "limit": 10
})

# Get system health status
system_health = await mcp_client.call_tool("authentik_get_system_config", {})
```

### Application Management

```python
# Application lifecycle management

# List all applications
apps = await mcp_client.call_tool("authentik_list_applications", {})

# Create a new application
new_app = await mcp_client.call_tool("authentik_create_application", {
    "name": "My New App",
    "slug": "my-new-app",
    "meta_description": "A new application for the company",
    "policy_engine_mode": "any"
})

# Check application status (diagnostic)
app_status = await mcp_client.call_tool("authentik_get_application_status", {
    "app_slug": "my-new-app"
})
```

## API Token Setup Guide

### Creating Tokens in Authentik

1. **Log in to Authentik**
   - Open your Authentik instance in a browser
   - Log in with administrator credentials

2. **Navigate to Token Management**
   - Go to **Directory** → **Tokens**
   - Click **Create** to create a new token

3. **Configure Token Permissions**

   **For Full MCP Server (authentik-mcp):**
   - Set **Intent** to "API"
   - Grant full permissions for:
     - User management
     - Group management  
     - Application management
     - Flow management
     - Provider management
     - Token management

   **For Diagnostic MCP Server (authentik-diag-mcp):**
   - Set **Intent** to "API"
   - Grant read-only permissions for:
     - View users
     - View groups
     - View applications
     - View events
     - View flows
     - View providers
     - View configuration

4. **Save and Copy Token**
   - Click **Create**
   - Copy the generated token immediately
   - Store securely (you won't be able to view it again)

### Token Security Best Practices

- **Separate Tokens**: Use different tokens for different environments (dev, staging, prod)
- **Minimal Permissions**: Grant only the permissions needed for each use case
- **Regular Rotation**: Rotate tokens regularly (monthly/quarterly)
- **Secure Storage**: Store tokens in environment variables or secure vaults
- **Monitor Usage**: Regularly review token usage in Authentik's audit logs

## Troubleshooting

### Common Issues

1. **Connection Errors**
   ```bash
   # Check connectivity
   curl -H "Authorization: Bearer your-token" https://auth.company.com/api/v3/root/config/
   ```

2. **SSL Certificate Issues**
   ```bash
   # Disable SSL verification (not recommended for production)
   authentik-mcp --base-url https://auth.company.com --token your-token --no-verify-ssl
   ```

3. **Permission Errors**
   - Verify token has required permissions
   - Check token expiration
   - Confirm API endpoint accessibility

4. **Python Version Issues**
   - Ensure Python 3.10+ is installed
   - Update pip: `pip install --upgrade pip`

5. **Node.js Version Issues**
   - Ensure Node.js 18+ is installed
   - Clear npm cache: `npm cache clean --force`

### Debugging Tips

- Enable verbose logging in your MCP client
- Check Authentik's event logs for API access attempts
- Verify network connectivity and firewall rules
- Test API endpoints directly with curl

### Getting Help

- [Authentik Documentation](https://docs.goauthentik.io/)
- [GitHub Issues](https://github.com/goauthentik/authentik-mcp/issues)
- [Authentik Community Discussions](https://github.com/goauthentik/authentik/discussions)
- [MCP Documentation](https://modelcontextprotocol.io/)