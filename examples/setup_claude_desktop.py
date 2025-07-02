#!/usr/bin/env python3
"""
Example script showing how to use the authentik-mcp server with Claude Desktop.

This script demonstrates:
1. Setting up the MCP server configuration
2. Basic usage patterns
3. Error handling
"""

import json
from pathlib import Path


def create_claude_config():
    """Create a Claude Desktop configuration for the Authentik MCP servers."""
    
    # Get the home directory
    home = Path.home()
    
    # Claude Desktop config path (adjust for your OS)
    config_dir = home / ".config" / "claude-desktop"  # Linux
    # For macOS: home / "Library" / "Application Support" / "Claude"
    # For Windows: home / "AppData" / "Roaming" / "Claude"
    
    config_dir.mkdir(parents=True, exist_ok=True)
    config_file = config_dir / "claude_desktop_config.json"
    
    # Basic configuration template
    config = {
        "mcpServers": {
            "authentik-full": {
                "command": "uvx",
                "args": ["authentik-mcp"],
                "env": {
                    "AUTHENTIK_BASE_URL": "https://your-authentik-instance.com",
                    "AUTHENTIK_TOKEN": "your-api-token-here"
                }
            },
            "authentik-diag": {
                "command": "uvx",
                "args": ["authentik-diag-mcp"],
                "env": {
                    "AUTHENTIK_BASE_URL": "https://your-authentik-instance.com",
                    "AUTHENTIK_TOKEN": "your-readonly-token-here"
                }
            }
        }
    }
    
    # If config file exists, merge with existing config
    if config_file.exists():
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
            
            # Merge MCP servers
            if "mcpServers" not in existing_config:
                existing_config["mcpServers"] = {}
            
            existing_config["mcpServers"].update(config["mcpServers"])
            config = existing_config
            
        except json.JSONDecodeError:
            print("Warning: Existing config file is not valid JSON, creating new one")
    
    # Write configuration
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)
    
    print(f"Configuration written to: {config_file}")
    print("\nNext steps:")
    print("1. Edit the configuration file to add your actual Authentik URL and tokens")
    print("2. Restart Claude Desktop")
    print("3. The Authentik tools should be available in Claude")
    
    return config_file


def example_usage():
    """Show example usage patterns."""
    
    examples = """
Example Claude prompts you can use with the Authentik MCP servers:

## User Management
- "Show me all users in Authentik"
- "Create a new user named John Doe with email john@example.com"
- "Find users who haven't logged in recently"
- "Update the email for user with ID 123"

## Event Analysis  
- "Show me recent authentication events"
- "Find failed login attempts in the last 24 hours"
- "Show me events for a specific user"
- "Analyze security events from the past week"

## Group Management
- "List all groups in Authentik"
- "Create a new group called 'Developers'"
- "Add user to the 'Administrators' group"
- "Show members of the 'Support' group"

## Application Management
- "Show all configured applications"
- "Create a new OAuth2 application"
- "Update application settings"
- "Show application usage statistics"

## Diagnostic Queries (using authentik-diag-mcp)
- "Check the health of my Authentik instance"
- "Show system information and version"
- "Generate a security report"
- "Show recent system events"

## Advanced Queries
- "Show me users who are in multiple groups"
- "Find applications with misconfigured security settings"
- "Generate a compliance report for user access"
- "Show authentication patterns for analysis"
"""
    
    print(examples)


if __name__ == "__main__":
    print("Authentik MCP Server Setup Example")
    print("==================================")
    
    # Create Claude Desktop configuration
    claude_config_file = create_claude_config()
    
    print("\n" + "="*50)
    
    # Show usage examples
    example_usage()
    
    print("\nConfiguration file created!")
    print(f"Edit {claude_config_file} with your Authentik details.")
