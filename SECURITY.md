# Security Policy

## Supported Versions

Currently, the following versions are supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

### 2. Send a private email to the maintainers

Please send details of the vulnerability to:
- Email: [roney.dsilva@cdmx.in]
- Subject: "Security Vulnerability in authentik-mcp"

### 3. Include the following information:

- **Description**: A detailed description of the vulnerability
- **Steps to Reproduce**: Clear steps showing how to exploit the vulnerability
- **Impact**: What an attacker could potentially do
- **Affected Components**: Which parts of the codebase are affected
- **Suggested Fix**: If you have ideas for fixing it

### 4. What to expect:

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Investigation**: We will investigate and validate the vulnerability within 7 days
- **Updates**: We will provide regular updates on our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

## Security Considerations for Users

### API Token Security

- **Never commit API tokens** to version control
- Use environment variables or secure configuration files
- Rotate API tokens regularly
- Use tokens with minimal required permissions

### Network Security

- Always use HTTPS when connecting to Authentik
- Consider using VPN or private networks for sensitive environments
- Validate SSL certificates

### MCP Server Security

- Run MCP servers in isolated environments when possible
- Limit network access to only required ports
- Use proper authentication and authorization
- Monitor server logs for suspicious activity

### Configuration Security

- Protect configuration files containing sensitive information
- Use file permissions to restrict access (chmod 600)
- Consider using encrypted configuration stores

## Known Security Considerations

### API Access
- This tool provides access to Authentik APIs with the permissions of the provided token
- Ensure tokens used have appropriate scope limitations
- Monitor API usage for unexpected patterns

### Data Exposure
- Be cautious when logging or debugging - avoid exposing sensitive data
- MCP protocol communication should be secured in production environments

### Dependencies
- We regularly update dependencies to address security vulnerabilities
- Use `npm audit` and `uv check` to monitor for known vulnerabilities

## Security Updates

Security updates will be:
- Released as patch versions (e.g., 0.1.1, 0.1.2)
- Announced in release notes with "Security" label
- Pushed to all supported versions when possible

## Contact

For security-related questions or concerns:
- Email: [roney.dsilva@cdmx.in]
- For non-security issues, use GitHub Issues

---

**Note**: Replace placeholder email addresses with actual contact information before publishing.
