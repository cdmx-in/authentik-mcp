#!/usr/bin/env node

/**
 * Authentik MCP Server - Full API Integration
 * 
 * This MCP server provides comprehensive access to Authentik's API including:
 * - User management (CRUD operations)
 * - Group management  
 * - Application management
 * - Flow management
 * - Event monitoring
 * - System administration
 * - Provider management
 * - Policy management
 * - Property mapping management
 * - Source management
 * - Tenant management
 * - Token management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Command } from 'commander';
import { z } from 'zod';

// Configuration schema
const AuthentikConfigSchema = z.object({
  baseUrl: z.string().url(),
  token: z.string().min(1),
  verifySSL: z.boolean().default(true),
});

type AuthentikConfig = z.infer<typeof AuthentikConfigSchema>;

// Authentik API Client
class AuthentikClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: AuthentikConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v3/`,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: config.verifySSL ? undefined : { rejectUnauthorized: false },
      timeout: 30000,
    });
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
        data,
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error(`API request failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

// Global client instance
let authentikClient: AuthentikClient | null = null;

// Initialize MCP server
const server = new Server(
  {
    name: 'authentik-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'authentik://users',
        name: 'Users',
        mimeType: 'application/json',
        description: 'List and manage Authentik users',
      },
      {
        uri: 'authentik://groups',
        name: 'Groups',
        mimeType: 'application/json',
        description: 'List and manage Authentik groups',
      },
      {
        uri: 'authentik://applications',
        name: 'Applications',
        mimeType: 'application/json',
        description: 'List and manage Authentik applications',
      },
      {
        uri: 'authentik://events',
        name: 'Events',
        mimeType: 'application/json',
        description: 'View Authentik system events and audit logs',
      },
      {
        uri: 'authentik://flows',
        name: 'Flows',
        mimeType: 'application/json',
        description: 'List and manage Authentik authentication flows',
      },
      {
        uri: 'authentik://providers',
        name: 'Providers',
        mimeType: 'application/json',
        description: 'List and manage Authentik providers',
      },
    ],
  };
});

// Read specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (!authentikClient) {
    throw new Error('Authentik client not initialized');
  }

  const { uri } = request.params;

  try {
    let data: any;
    switch (uri) {
      case 'authentik://users':
        data = await authentikClient.request('GET', '/core/users/');
        break;
      case 'authentik://groups':
        data = await authentikClient.request('GET', '/core/groups/');
        break;
      case 'authentik://applications':
        data = await authentikClient.request('GET', '/core/applications/');
        break;
      case 'authentik://events':
        data = await authentikClient.request('GET', '/events/events/');
        break;
      case 'authentik://flows':
        data = await authentikClient.request('GET', '/flows/instances/');
        break;
      case 'authentik://providers':
        data = await authentikClient.request('GET', '/providers/all/');
        break;
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`Failed to read resource ${uri}: ${error.message}`);
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // User Management Tools
      {
        name: 'authentik_list_users',
        description: 'List all users in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for filtering users' },
            is_active: { type: 'boolean', description: 'Filter by active status' },
            group: { type: 'string', description: 'Filter by group membership' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_user',
        description: 'Get details of a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', description: 'User ID to retrieve' },
          },
          required: ['user_id'],
        },
      },
      {
        name: 'authentik_create_user',
        description: 'Create a new user in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', description: 'Email address' },
            name: { type: 'string', description: 'Full name' },
            password: { type: 'string', description: 'Password' },
            is_active: { type: 'boolean', description: 'Whether user is active', default: true },
            groups: { type: 'array', items: { type: 'integer' }, description: 'Group IDs to assign' },
          },
          required: ['username', 'email', 'name'],
        },
      },
      {
        name: 'authentik_update_user',
        description: 'Update an existing user',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', description: 'User ID to update' },
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', description: 'Email address' },
            name: { type: 'string', description: 'Full name' },
            is_active: { type: 'boolean', description: 'Whether user is active' },
            groups: { type: 'array', items: { type: 'integer' }, description: 'Group IDs to assign' },
          },
          required: ['user_id'],
        },
      },
      {
        name: 'authentik_delete_user',
        description: 'Delete a user from Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', description: 'User ID to delete' },
          },
          required: ['user_id'],
        },
      },

      // Group Management Tools
      {
        name: 'authentik_list_groups',
        description: 'List all groups in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for filtering groups' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_group',
        description: 'Get details of a specific group',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: { type: 'string', description: 'Group ID to retrieve' },
          },
          required: ['group_id'],
        },
      },
      {
        name: 'authentik_create_group',
        description: 'Create a new group in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Group name' },
            is_superuser: { type: 'boolean', description: 'Whether group has superuser privileges', default: false },
            parent: { type: 'string', description: 'Parent group ID' },
            users: { type: 'array', items: { type: 'integer' }, description: 'User IDs to add to group' },
          },
          required: ['name'],
        },
      },

      // Application Management Tools
      {
        name: 'authentik_list_applications',
        description: 'List all applications in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for filtering applications' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_application',
        description: 'Get details of a specific application',
        inputSchema: {
          type: 'object',
          properties: {
            app_slug: { type: 'string', description: 'Application slug to retrieve' },
          },
          required: ['app_slug'],
        },
      },
      {
        name: 'authentik_create_application',
        description: 'Create a new application in Authentik',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Application name' },
            slug: { type: 'string', description: 'Application slug' },
            provider: { type: 'integer', description: 'Provider ID' },
            meta_description: { type: 'string', description: 'Application description' },
            meta_publisher: { type: 'string', description: 'Application publisher' },
            policy_engine_mode: { type: 'string', enum: ['all', 'any'], description: 'Policy engine mode', default: 'any' },
          },
          required: ['name', 'slug'],
        },
      },

      // Event Monitoring Tools
      {
        name: 'authentik_list_events',
        description: 'List system events and audit logs',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Filter by event action' },
            client_ip: { type: 'string', description: 'Filter by client IP' },
            username: { type: 'string', description: 'Filter by username' },
            ordering: { type: 'string', description: 'Field to order by', default: '-created' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_event',
        description: 'Get details of a specific event',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: { type: 'string', description: 'Event ID to retrieve' },
          },
          required: ['event_id'],
        },
      },

      // Flow Management Tools
      {
        name: 'authentik_list_flows',
        description: 'List all authentication flows',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for filtering flows' },
            designation: { type: 'string', description: 'Filter by flow designation' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_flow',
        description: 'Get details of a specific flow',
        inputSchema: {
          type: 'object',
          properties: {
            flow_slug: { type: 'string', description: 'Flow slug to retrieve' },
          },
          required: ['flow_slug'],
        },
      },

      // Provider Management Tools
      {
        name: 'authentik_list_providers',
        description: 'List all providers',
        inputSchema: {
          type: 'object',
          properties: {
            application__isnull: { type: 'boolean', description: 'Filter providers without applications' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_provider',
        description: 'Get details of a specific provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider_id: { type: 'integer', description: 'Provider ID to retrieve' },
          },
          required: ['provider_id'],
        },
      },

      // Token Management Tools
      {
        name: 'authentik_list_tokens',
        description: 'List API tokens',
        inputSchema: {
          type: 'object',
          properties: {
            user: { type: 'integer', description: 'Filter by user ID' },
            identifier: { type: 'string', description: 'Filter by token identifier' },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_create_token',
        description: 'Create a new API token',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: { type: 'string', description: 'Token identifier' },
            user: { type: 'integer', description: 'User ID for the token' },
            description: { type: 'string', description: 'Token description' },
            expires: { type: 'string', format: 'date-time', description: 'Token expiration date' },
            expiring: { type: 'boolean', description: 'Whether token expires', default: true },
          },
          required: ['identifier', 'user'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!authentikClient) {
    throw new Error('Authentik client not initialized');
  }

  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      // User Management Tools
      case 'authentik_list_users':
        result = await authentikClient.request('GET', '/core/users/', undefined, args);
        break;
      
      case 'authentik_get_user':
        if (!args?.user_id) {
          throw new Error('user_id is required');
        }
        result = await authentikClient.request('GET', `/core/users/${args.user_id}/`);
        break;
      
      case 'authentik_create_user':
        result = await authentikClient.request('POST', '/core/users/', args);
        break;
      
      case 'authentik_update_user':
        if (!args?.user_id) {
          throw new Error('user_id is required');
        }
        const { user_id, ...updateData } = args;
        result = await authentikClient.request('PATCH', `/core/users/${user_id}/`, updateData);
        break;
      
      case 'authentik_delete_user':
        if (!args?.user_id) {
          throw new Error('user_id is required');
        }
        await authentikClient.request('DELETE', `/core/users/${args.user_id}/`);
        result = { message: `User ${args.user_id} deleted successfully` };
        break;

      // Group Management Tools
      case 'authentik_list_groups':
        result = await authentikClient.request('GET', '/core/groups/', undefined, args);
        break;
      
      case 'authentik_get_group':
        if (!args?.group_id) {
          throw new Error('group_id is required');
        }
        result = await authentikClient.request('GET', `/core/groups/${args.group_id}/`);
        break;
      
      case 'authentik_create_group':
        result = await authentikClient.request('POST', '/core/groups/', args);
        break;

      // Application Management Tools
      case 'authentik_list_applications':
        result = await authentikClient.request('GET', '/core/applications/', undefined, args);
        break;
      
      case 'authentik_get_application':
        if (!args?.app_slug) {
          throw new Error('app_slug is required');
        }
        result = await authentikClient.request('GET', `/core/applications/${args.app_slug}/`);
        break;
      
      case 'authentik_create_application':
        result = await authentikClient.request('POST', '/core/applications/', args);
        break;

      // Event Monitoring Tools
      case 'authentik_list_events':
        result = await authentikClient.request('GET', '/events/events/', undefined, args);
        break;
      
      case 'authentik_get_event':
        if (!args?.event_id) {
          throw new Error('event_id is required');
        }
        result = await authentikClient.request('GET', `/events/events/${args.event_id}/`);
        break;

      // Flow Management Tools
      case 'authentik_list_flows':
        result = await authentikClient.request('GET', '/flows/instances/', undefined, args);
        break;
      
      case 'authentik_get_flow':
        if (!args?.flow_slug) {
          throw new Error('flow_slug is required');
        }
        result = await authentikClient.request('GET', `/flows/instances/${args.flow_slug}/`);
        break;

      // Provider Management Tools
      case 'authentik_list_providers':
        result = await authentikClient.request('GET', '/providers/all/', undefined, args);
        break;
      
      case 'authentik_get_provider':
        if (!args?.provider_id) {
          throw new Error('provider_id is required');
        }
        result = await authentikClient.request('GET', `/providers/all/${args.provider_id}/`);
        break;

      // Token Management Tools
      case 'authentik_list_tokens':
        result = await authentikClient.request('GET', '/core/tokens/', undefined, args);
        break;
      
      case 'authentik_create_token':
        result = await authentikClient.request('POST', '/core/tokens/', args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    console.error(`Tool call failed: ${error.message}`);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Main function
async function main() {
  const program = new Command();
  
  program
    .name('authentik-mcp')
    .description('Authentik MCP Server - Full API Integration')
    .version('0.1.0')
    .requiredOption('--base-url <url>', 'Authentik base URL')
    .requiredOption('--token <token>', 'Authentik API token')
    .option('--no-verify-ssl', 'Disable SSL verification')
    .parse();

  const options = program.opts();

  // Initialize Authentik client
  try {
    const config = AuthentikConfigSchema.parse({
      baseUrl: options.baseUrl,
      token: options.token,
      verifySSL: options.verifySsl !== false,
    });

    authentikClient = new AuthentikClient(config);

    // Test connection
    await authentikClient.request('GET', '/root/config/');
    console.error('Successfully connected to Authentik API');
  } catch (error: any) {
    console.error(`Failed to connect to Authentik API: ${error.message}`);
    process.exit(1);
  }

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Authentik MCP Server running');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}