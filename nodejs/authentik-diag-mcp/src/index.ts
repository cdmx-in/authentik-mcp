#!/usr/bin/env node

/**
 * Authentik Diagnostic MCP Server - Read-Only API Integration
 *
 * This MCP server provides diagnostic and read-only access to Authentik's API including:
 * - Event monitoring and audit logs
 * - User information (read-only)
 * - System health and configuration
 * - Group membership information (read-only)
 * - Application status (read-only)
 * - Flow status monitoring
 * - Provider status monitoring
 *
 * This server is designed for monitoring and diagnostics only - no write operations are supported.
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

// Authentik API Client (Read-only)
class AuthentikClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: AuthentikConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v3/`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: config.verifySSL ? undefined : { rejectUnauthorized: false },
      timeout: 30000,
    });
  }

  async request<T = unknown>(
    method: 'GET' | 'HEAD' | 'OPTIONS',
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    // Only allow read-only methods for diagnostic mode
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      throw new Error(`Method ${method} not allowed in diagnostic mode`);
    }

    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
        params,
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API request failed: ${errorMessage}`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        console.error(`Status: ${axiosError.response.status}`);
        console.error(`Data: ${JSON.stringify(axiosError.response.data)}`);
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
    name: 'authentik-diag-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available diagnostic resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'authentik://events',
        name: 'Events & Audit Logs',
        mimeType: 'application/json',
        description: 'View Authentik system events and audit logs for monitoring and diagnostics',
      },
      {
        uri: 'authentik://users/info',
        name: 'User Information',
        mimeType: 'application/json',
        description: 'Read-only access to user information for diagnostics',
      },
      {
        uri: 'authentik://groups/info',
        name: 'Group Information',
        mimeType: 'application/json',
        description: 'Read-only access to group information for diagnostics',
      },
      {
        uri: 'authentik://applications/status',
        name: 'Application Status',
        mimeType: 'application/json',
        description: 'Read-only application status for monitoring',
      },
      {
        uri: 'authentik://flows/status',
        name: 'Flow Status',
        mimeType: 'application/json',
        description: 'Read-only flow status for monitoring',
      },
      {
        uri: 'authentik://system/health',
        name: 'System Health',
        mimeType: 'application/json',
        description: 'System health and configuration information',
      },
    ],
  };
});

// Read specific diagnostic resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (!authentikClient) {
    throw new Error('Authentik client not initialized');
  }

  const { uri } = request.params;

  try {
    let data: unknown;
    switch (uri) {
      case 'authentik://events':
        data = await authentikClient.request('GET', '/events/events/');
        break;
      case 'authentik://users/info':
        data = await authentikClient.request('GET', '/core/users/');
        break;
      case 'authentik://groups/info':
        data = await authentikClient.request('GET', '/core/groups/');
        break;
      case 'authentik://applications/status':
        data = await authentikClient.request('GET', '/core/applications/');
        break;
      case 'authentik://flows/status':
        data = await authentikClient.request('GET', '/flows/instances/');
        break;
      case 'authentik://system/health':
        try {
          data = await authentikClient.request('GET', '/root/config/');
        } catch {
          data = { error: 'System health information not accessible' };
        }
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
  }
});

// List available diagnostic tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Event Monitoring and Audit Tools
      {
        name: 'authentik_list_events',
        description: 'List system events and audit logs for monitoring and diagnostics',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              description: 'Filter by event action (e.g., login, logout, update_user)',
            },
            client_ip: { type: 'string', description: 'Filter by client IP address' },
            username: { type: 'string', description: 'Filter by username' },
            tenant: { type: 'string', description: 'Filter by tenant' },
            created__gte: {
              type: 'string',
              format: 'date-time',
              description: 'Events created after this date',
            },
            created__lte: {
              type: 'string',
              format: 'date-time',
              description: 'Events created before this date',
            },
            ordering: { type: 'string', description: 'Field to order by', default: '-created' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_event',
        description: 'Get detailed information about a specific event',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: { type: 'string', description: 'Event ID to retrieve' },
          },
          required: ['event_id'],
        },
      },
      {
        name: 'authentik_search_events',
        description: 'Search events by context data and other criteria',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for event context' },
            action: { type: 'string', description: 'Filter by specific action' },
            limit: { type: 'integer', description: 'Limit number of results', default: 50 },
          },
        },
      },

      // User Information Tools (Read-Only)
      {
        name: 'authentik_get_user_info',
        description: 'Get diagnostic information about a specific user (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', description: 'User ID to retrieve information for' },
          },
          required: ['user_id'],
        },
      },
      {
        name: 'authentik_list_users_info',
        description: 'List users with basic information for diagnostics (read-only)',
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
        name: 'authentik_get_user_events',
        description: 'Get events related to a specific user for diagnostics',
        inputSchema: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'Username to get events for' },
            action: { type: 'string', description: 'Filter by event action' },
            limit: { type: 'integer', description: 'Limit number of results', default: 20 },
          },
        },
      },

      // Group Information Tools (Read-Only)
      {
        name: 'authentik_get_group_info',
        description: 'Get diagnostic information about a specific group (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: { type: 'string', description: 'Group ID to retrieve information for' },
          },
          required: ['group_id'],
        },
      },
      {
        name: 'authentik_list_groups_info',
        description: 'List groups with basic information for diagnostics (read-only)',
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
        name: 'authentik_get_group_members',
        description: 'Get members of a specific group for diagnostics',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: { type: 'string', description: 'Group ID to get members for' },
          },
          required: ['group_id'],
        },
      },

      // Application Status Tools (Read-Only)
      {
        name: 'authentik_get_application_status',
        description: 'Get status information about a specific application (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            app_slug: { type: 'string', description: 'Application slug to check status for' },
          },
          required: ['app_slug'],
        },
      },
      {
        name: 'authentik_list_applications_status',
        description: 'List applications with status information for monitoring (read-only)',
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

      // Flow Status Tools (Read-Only)
      {
        name: 'authentik_get_flow_status',
        description: 'Get status information about a specific flow (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            flow_slug: { type: 'string', description: 'Flow slug to check status for' },
          },
          required: ['flow_slug'],
        },
      },
      {
        name: 'authentik_list_flows_status',
        description: 'List flows with status information for monitoring (read-only)',
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

      // System Health and Configuration Tools
      {
        name: 'authentik_get_system_config',
        description: 'Get system configuration for diagnostics (read-only)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'authentik_get_version_info',
        description: 'Get Authentik version and build information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // Provider Status Tools (Read-Only)
      {
        name: 'authentik_list_providers_status',
        description: 'List providers with status information for monitoring (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            application__isnull: {
              type: 'boolean',
              description: 'Filter providers without applications',
            },
            ordering: { type: 'string', description: 'Field to order by' },
            page: { type: 'integer', description: 'Page number', default: 1 },
            page_size: { type: 'integer', description: 'Number of items per page', default: 20 },
          },
        },
      },
      {
        name: 'authentik_get_provider_status',
        description: 'Get status information about a specific provider (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            provider_id: { type: 'integer', description: 'Provider ID to check status for' },
          },
          required: ['provider_id'],
        },
      },
    ],
  };
});

// Handle diagnostic tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!authentikClient) {
    throw new Error('Authentik client not initialized');
  }

  const { name, arguments: args } = request.params;

  // Ensure args is defined
  if (!args) {
    throw new Error('Missing arguments in tool call');
  }

  try {
    let result: unknown;

    switch (name) {
      // Event Monitoring Tools
      case 'authentik_list_events':
        result = await authentikClient.request('GET', '/events/events/', args);
        break;

      case 'authentik_get_event':
        result = await authentikClient.request('GET', `/events/events/${args.event_id}/`);
        break;

      case 'authentik_search_events':
        result = await authentikClient.request('GET', '/events/events/', args);
        break;

      // User Information Tools
      case 'authentik_get_user_info':
        result = await authentikClient.request('GET', `/core/users/${args.user_id}/`);
        break;

      case 'authentik_list_users_info':
        result = await authentikClient.request('GET', '/core/users/', args);
        break;

      case 'authentik_get_user_events': {
        const userEventParams: Record<string, unknown> = { username: args.username };
        if ('action' in args && args.action) userEventParams.action = args.action;
        if ('limit' in args && args.limit) userEventParams.page_size = args.limit;
        result = await authentikClient.request('GET', '/events/events/', userEventParams);
        break;
      }

      // Group Information Tools
      case 'authentik_get_group_info':
        result = await authentikClient.request('GET', `/core/groups/${args.group_id}/`);
        break;

      case 'authentik_list_groups_info':
        result = await authentikClient.request('GET', '/core/groups/', args);
        break;

      case 'authentik_get_group_members': {
        const groupData = await authentikClient.request('GET', `/core/groups/${args.group_id}/`);
        const typedGroupData = groupData as { users_obj?: unknown[] };
        result = { members: typedGroupData.users_obj || [] };
        break;
      }

      // Application Status Tools
      case 'authentik_get_application_status':
        result = await authentikClient.request('GET', `/core/applications/${args.app_slug}/`);
        break;

      case 'authentik_list_applications_status':
        result = await authentikClient.request('GET', '/core/applications/', args);
        break;

      // Flow Status Tools
      case 'authentik_get_flow_status':
        result = await authentikClient.request('GET', `/flows/instances/${args.flow_slug}/`);
        break;

      case 'authentik_list_flows_status':
        result = await authentikClient.request('GET', '/flows/instances/', args);
        break;

      // System Health Tools
      case 'authentik_get_system_config':
        result = await authentikClient.request('GET', '/root/config/');
        break;

      case 'authentik_get_version_info':
        try {
          const configData = await authentikClient.request('GET', '/root/config/');
          const typedConfigData = configData as { version?: string; build_hash?: string };
          result = {
            version: typedConfigData.version || 'unknown',
            build_hash: typedConfigData.build_hash || 'unknown',
          };
        } catch {
          result = { error: 'Version information not accessible' };
        }
        break;

      // Provider Status Tools
      case 'authentik_list_providers_status':
        result = await authentikClient.request('GET', '/providers/all/', args);
        break;

      case 'authentik_get_provider_status':
        result = await authentikClient.request('GET', `/providers/all/${args.provider_id}/`);
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Tool call failed: ${errorMessage}`);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
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
    .name('authentik-diag-mcp')
    .description('Authentik Diagnostic MCP Server - Read-Only API Integration')
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
    console.error('Successfully connected to Authentik API (diagnostic mode)');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to connect to Authentik API: ${errorMessage}`);
    process.exit(1);
  }

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Authentik Diagnostic MCP Server running');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}
