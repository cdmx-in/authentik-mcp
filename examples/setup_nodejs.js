#!/usr/bin/env node

/**
 * Example script for setting up and testing the Authentik MCP server (Node.js version)
 * 
 * This demonstrates:
 * 1. Basic MCP server setup
 * 2. Testing server connectivity
 * 3. Example tool usage
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Create Claude Desktop configuration for Node.js MCP servers
 */
async function createClaudeConfig() {
    const homeDir = os.homedir();
    
    // Determine config directory based on OS
    let configDir;
    switch (os.platform()) {
        case 'darwin': // macOS
            configDir = path.join(homeDir, 'Library', 'Application Support', 'Claude');
            break;
        case 'win32': // Windows
            configDir = path.join(homeDir, 'AppData', 'Roaming', 'Claude');
            break;
        default: // Linux and others
            configDir = path.join(homeDir, '.config', 'claude-desktop');
    }
    
    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });
    
    const configFile = path.join(configDir, 'claude_desktop_config.json');
    
    // Configuration template for Node.js packages
    const config = {
        mcpServers: {
            "authentik-full-js": {
                "command": "npx",
                "args": ["authentik-mcp"],
                "env": {
                    "AUTHENTIK_BASE_URL": "https://your-authentik-instance.com",
                    "AUTHENTIK_TOKEN": "your-api-token-here"
                }
            },
            "authentik-diag-js": {
                "command": "npx", 
                "args": ["authentik-diag-mcp"],
                "env": {
                    "AUTHENTIK_BASE_URL": "https://your-authentik-instance.com",
                    "AUTHENTIK_TOKEN": "your-readonly-token-here"
                }
            }
        }
    };
    
    // Try to read existing config and merge
    let existingConfig = {};
    try {
        const configData = await fs.readFile(configFile, 'utf8');
        existingConfig = JSON.parse(configData);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('Warning: Could not read existing config file:', error.message);
        }
    }
    
    // Merge configurations
    if (!existingConfig.mcpServers) {
        existingConfig.mcpServers = {};
    }
    Object.assign(existingConfig.mcpServers, config.mcpServers);
    
    // Write configuration
    await fs.writeFile(configFile, JSON.stringify(existingConfig, null, 2), 'utf8');
    
    console.log(`Configuration written to: ${configFile}`);
    console.log('\nNext steps:');
    console.log('1. Edit the configuration file to add your actual Authentik URL and tokens');
    console.log('2. Restart Claude Desktop');
    console.log('3. The Authentik tools should be available in Claude');
    
    return configFile;
}

/**
 * Show example package.json configuration for local development
 */
function showPackageJsonExample() {
    const examplePackageJson = {
        "name": "my-authentik-integration",
        "version": "1.0.0",
        "description": "Custom Authentik integration using MCP",
        "type": "module",
        "scripts": {
            "start": "node index.js",
            "dev": "node --watch index.js",
            "mcp:full": "npx authentik-mcp",
            "mcp:diag": "npx authentik-diag-mcp"
        },
        "dependencies": {
            "authentik-mcp": "^0.1.0",
            "authentik-diag-mcp": "^0.1.0"
        },
        "devDependencies": {
            "@types/node": "^20.0.0",
            "typescript": "^5.0.0"
        }
    };
    
    console.log('\n=== Example package.json for your project ===');
    console.log(JSON.stringify(examplePackageJson, null, 2));
    console.log('\nTo use in your project:');
    console.log('1. npm init (if new project)');
    console.log('2. npm install authentik-mcp authentik-diag-mcp');
    console.log('3. Add the above scripts to your package.json');
}

/**
 * Show example environment configuration
 */
function showEnvironmentExample() {
    const envExample = `# .env file for Authentik MCP configuration
AUTHENTIK_BASE_URL=https://your-authentik-instance.com
AUTHENTIK_TOKEN=your-api-token-here

# Optional settings
AUTHENTIK_TIMEOUT=30000
AUTHENTIK_DEBUG=false
AUTHENTIK_USER_AGENT=MyApp/1.0

# MCP Server settings (if running as HTTP server)
MCP_HOST=localhost
MCP_PORT=3000`;

    console.log('\n=== Example .env configuration ===');
    console.log(envExample);
}

/**
 * Show TypeScript usage examples
 */
function showTypeScriptExamples() {
    const tsExample = `// example.ts - Using the MCP server programmatically
import { AuthentikMCPServer } from 'authentik-mcp';

async function main() {
    const server = new AuthentikMCPServer({
        baseUrl: process.env.AUTHENTIK_BASE_URL!,
        token: process.env.AUTHENTIK_TOKEN!
    });
    
    // Start the server
    await server.start();
    
    console.log('Authentik MCP Server is running!');
    
    // Example: List users (if you have access)
    try {
        const users = await server.listUsers();
        console.log('Users:', users);
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

main().catch(console.error);`;

    console.log('\n=== TypeScript Usage Example ===');
    console.log(tsExample);
}

/**
 * Main function
 */
async function main() {
    console.log('Authentik MCP Server Setup (Node.js)');
    console.log('=====================================');
    
    try {
        // Create Claude Desktop configuration
        const configFile = await createClaudeConfig();
        
        console.log('\n' + '='.repeat(50));
        
        // Show additional examples
        showPackageJsonExample();
        showEnvironmentExample();
        showTypeScriptExamples();
        
        console.log('\n' + '='.repeat(50));
        console.log('Setup complete!');
        console.log(`Claude Desktop config: ${configFile}`);
        console.log('\nFor local development:');
        console.log('1. npm install authentik-mcp authentik-diag-mcp');
        console.log('2. Create .env file with your Authentik credentials');
        console.log('3. Run: npx authentik-mcp or npx authentik-diag-mcp');
        
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}
