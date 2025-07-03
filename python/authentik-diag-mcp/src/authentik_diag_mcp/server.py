#!/usr/bin/env python3
"""
Authentik Diagnostic MCP Server - Read-Only API Integration

This MCP server provides diagnostic and read-only access to Authentik's API including:
- Event monitoring and audit logs
- User information (read-only)
- System health and configuration
- Group membership information (read-only)
- Application status (read-only)
- Flow status monitoring
- Provider status monitoring

This server is designed for monitoring and diagnostics only - no write operations are supported.
"""

import argparse
import asyncio
import logging
from collections.abc import Sequence
from typing import Any
from urllib.parse import urljoin

import httpx
from mcp.server import NotificationOptions, Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    TextContent,
    Tool,
)
from pydantic import AnyUrl, BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("authentik-diag-mcp")

# Initialize MCP server
server: Server[None] = Server("authentik-diag-mcp")


class AuthentikConfig(BaseModel):
    """Configuration for Authentik API client."""
    base_url: str = Field(..., description="Base URL of Authentik instance")
    token: str = Field(..., description="API token for authentication")
    verify_ssl: bool = Field(default=True, description="Verify SSL certificates")


class AuthentikClient:
    """HTTP client for Authentik API."""

    def __init__(self, config: AuthentikConfig) -> None:
        self.config = config
        self.base_url = config.base_url.rstrip("/")
        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {config.token}"},
            verify=config.verify_ssl,
            timeout=30.0,
        )

    async def request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make a read-only API request to Authentik."""
        if method.upper() not in ["GET", "HEAD", "OPTIONS"]:
            error_msg = f"Method {method} not allowed in diagnostic mode"
            raise ValueError(error_msg)

        url = urljoin(f"{self.base_url}/api/v3/", endpoint.lstrip("/"))

        try:
            response = await self.client.request(
                method=method,
                url=url,
                params=params,
            )
            response.raise_for_status()
            result = response.json()
            return result if isinstance(result, dict) else {"data": result}
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code}: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Request failed: {e!s}")
            raise

    async def close(self) -> None:
        """Close the HTTP client."""
        await self.client.aclose()


# Global client instance
authentik_client: AuthentikClient | None = None


@server.list_resources()  # type: ignore[no-untyped-call,misc]
async def list_resources() -> list[Resource]:
    """List available Authentik diagnostic resources."""
    return [
        Resource(
            uri=AnyUrl("authentik://events"),
            name="Events & Audit Logs",
            mimeType="application/json",
            description="View Authentik system events and audit logs for monitoring and diagnostics",
        ),
        Resource(
            uri=AnyUrl("authentik://users/info"),
            name="User Information",
            mimeType="application/json",
            description="Read-only access to user information for diagnostics",
        ),
        Resource(
            uri=AnyUrl("authentik://groups/info"),
            name="Group Information",
            mimeType="application/json",
            description="Read-only access to group information for diagnostics",
        ),
        Resource(
            uri=AnyUrl("authentik://applications/status"),
            name="Application Status",
            mimeType="application/json",
            description="Read-only application status for monitoring",
        ),
        Resource(
            uri=AnyUrl("authentik://flows/status"),
            name="Flow Status",
            mimeType="application/json",
            description="Read-only flow status for monitoring",
        ),
        Resource(
            uri=AnyUrl("authentik://system/health"),
            name="System Health",
            mimeType="application/json",
            description="System health and configuration information",
        ),
    ]


@server.read_resource()  # type: ignore[no-untyped-call,misc]
async def read_resource(uri: str) -> str:
    """Read a specific Authentik diagnostic resource."""
    if not authentik_client:
        error_msg = "Authentik client not initialized"
        raise ValueError(error_msg)

    if uri == "authentik://events":
        data = await authentik_client.request("GET", "/events/events/")
        return f"Events and Audit Logs:\n{data}"
    if uri == "authentik://users/info":
        data = await authentik_client.request("GET", "/core/users/")
        return f"User Information:\n{data}"
    if uri == "authentik://groups/info":
        data = await authentik_client.request("GET", "/core/groups/")
        return f"Group Information:\n{data}"
    if uri == "authentik://applications/status":
        data = await authentik_client.request("GET", "/core/applications/")
        return f"Application Status:\n{data}"
    if uri == "authentik://flows/status":
        data = await authentik_client.request("GET", "/flows/instances/")
        return f"Flow Status:\n{data}"
    if uri == "authentik://system/health":
        try:
            config_data = await authentik_client.request("GET", "/root/config/")
        except Exception:
            return "System health information not accessible"
        else:
            return f"System Health and Configuration:\n{config_data}"
    else:
        error_msg = f"Unknown resource: {uri}"
        raise ValueError(error_msg)


@server.list_tools()  # type: ignore[no-untyped-call,misc]
async def list_tools() -> list[Tool]:
    """List available Authentik diagnostic tools."""
    return [
        # Event Monitoring and Audit Tools
        Tool(
            name="authentik_list_events",
            description="List system events and audit logs for monitoring and diagnostics",
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "description": "Filter by event action (e.g., 'login', 'logout', 'update_user')",
                    },
                    "client_ip": {"type": "string", "description": "Filter by client IP address"},
                    "username": {"type": "string", "description": "Filter by username"},
                    "tenant": {"type": "string", "description": "Filter by tenant"},
                    "created__gte": {
                        "type": "string",
                        "format": "date-time",
                        "description": "Events created after this date",
                    },
                    "created__lte": {
                        "type": "string",
                        "format": "date-time",
                        "description": "Events created before this date",
                    },
                    "ordering": {"type": "string", "description": "Field to order by", "default": "-created"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),
        Tool(
            name="authentik_get_event",
            description="Get detailed information about a specific event",
            inputSchema={
                "type": "object",
                "properties": {
                    "event_id": {"type": "string", "description": "Event ID to retrieve"},
                },
                "required": ["event_id"],
            },
        ),
        Tool(
            name="authentik_search_events",
            description="Search events by context data and other criteria",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for event context"},
                    "action": {"type": "string", "description": "Filter by specific action"},
                    "limit": {"type": "integer", "description": "Limit number of results", "default": 50},
                },
            },
        ),

        # User Information Tools (Read-Only)
        Tool(
            name="authentik_get_user_info",
            description="Get diagnostic information about a specific user (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "User ID to retrieve information for"},
                },
                "required": ["user_id"],
            },
        ),
        Tool(
            name="authentik_list_users_info",
            description="List users with basic information for diagnostics (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for filtering users"},
                    "is_active": {"type": "boolean", "description": "Filter by active status"},
                    "group": {"type": "string", "description": "Filter by group membership"},
                    "ordering": {"type": "string", "description": "Field to order by"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),
        Tool(
            name="authentik_get_user_events",
            description="Get events related to a specific user for diagnostics",
            inputSchema={
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "Username to get events for"},
                    "action": {"type": "string", "description": "Filter by event action"},
                    "limit": {"type": "integer", "description": "Limit number of results", "default": 20},
                },
            },
        ),

        # Group Information Tools (Read-Only)
        Tool(
            name="authentik_get_group_info",
            description="Get diagnostic information about a specific group (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "group_id": {"type": "string", "description": "Group ID to retrieve information for"},
                },
                "required": ["group_id"],
            },
        ),
        Tool(
            name="authentik_list_groups_info",
            description="List groups with basic information for diagnostics (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for filtering groups"},
                    "ordering": {"type": "string", "description": "Field to order by"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),
        Tool(
            name="authentik_get_group_members",
            description="Get members of a specific group for diagnostics",
            inputSchema={
                "type": "object",
                "properties": {
                    "group_id": {"type": "string", "description": "Group ID to get members for"},
                },
                "required": ["group_id"],
            },
        ),

        # Application Status Tools (Read-Only)
        Tool(
            name="authentik_get_application_status",
            description="Get status information about a specific application (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "app_slug": {"type": "string", "description": "Application slug to check status for"},
                },
                "required": ["app_slug"],
            },
        ),
        Tool(
            name="authentik_list_applications_status",
            description="List applications with status information for monitoring (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for filtering applications"},
                    "ordering": {"type": "string", "description": "Field to order by"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),

        # Flow Status Tools (Read-Only)
        Tool(
            name="authentik_get_flow_status",
            description="Get status information about a specific flow (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "flow_slug": {"type": "string", "description": "Flow slug to check status for"},
                },
                "required": ["flow_slug"],
            },
        ),
        Tool(
            name="authentik_list_flows_status",
            description="List flows with status information for monitoring (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for filtering flows"},
                    "designation": {"type": "string", "description": "Filter by flow designation"},
                    "ordering": {"type": "string", "description": "Field to order by"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),

        # System Health and Configuration Tools
        Tool(
            name="authentik_get_system_config",
            description="Get system configuration for diagnostics (read-only)",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
        Tool(
            name="authentik_get_version_info",
            description="Get Authentik version and build information",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),

        # Provider Status Tools (Read-Only)
        Tool(
            name="authentik_list_providers_status",
            description="List providers with status information for monitoring (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "application__isnull": {"type": "boolean", "description": "Filter providers without applications"},
                    "ordering": {"type": "string", "description": "Field to order by"},
                    "page": {"type": "integer", "description": "Page number", "default": 1},
                    "page_size": {"type": "integer", "description": "Number of items per page", "default": 20},
                },
            },
        ),
        Tool(
            name="authentik_get_provider_status",
            description="Get status information about a specific provider (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "provider_id": {"type": "integer", "description": "Provider ID to check status for"},
                },
                "required": ["provider_id"],
            },
        ),
    ]


@server.call_tool()  # type: ignore[misc]
async def call_tool(name: str, arguments: dict[str, Any]) -> Sequence[TextContent]:
    """Handle tool calls for Authentik diagnostic operations."""
    if not authentik_client:
        return [TextContent(type="text", text="Error: Authentik client not initialized")]

    try:
        # Event Monitoring Tools
        if name == "authentik_list_events":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/events/events/", params=params)
            return [TextContent(type="text", text=f"Events: {data}")]

        if name == "authentik_get_event":
            event_id = arguments["event_id"]
            data = await authentik_client.request("GET", f"/events/events/{event_id}/")
            return [TextContent(type="text", text=f"Event details: {data}")]

        if name == "authentik_search_events":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/events/events/", params=params)
            return [TextContent(type="text", text=f"Search results: {data}")]

        # User Information Tools
        if name == "authentik_get_user_info":
            user_id = arguments["user_id"]
            data = await authentik_client.request("GET", f"/core/users/{user_id}/")
            return [TextContent(type="text", text=f"User information: {data}")]

        if name == "authentik_list_users_info":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/core/users/", params=params)
            return [TextContent(type="text", text=f"Users information: {data}")]

        if name == "authentik_get_user_events":
            username = arguments["username"]
            params = {"username": username}
            if "action" in arguments:
                params["action"] = arguments["action"]
            if "limit" in arguments:
                params["page_size"] = arguments["limit"]
            data = await authentik_client.request("GET", "/events/events/", params=params)
            return [TextContent(type="text", text=f"User events: {data}")]

        # Group Information Tools
        if name == "authentik_get_group_info":
            group_id = arguments["group_id"]
            data = await authentik_client.request("GET", f"/core/groups/{group_id}/")
            return [TextContent(type="text", text=f"Group information: {data}")]

        if name == "authentik_list_groups_info":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/core/groups/", params=params)
            return [TextContent(type="text", text=f"Groups information: {data}")]

        if name == "authentik_get_group_members":
            group_id = arguments["group_id"]
            data = await authentik_client.request("GET", f"/core/groups/{group_id}/")
            members = data.get("users_obj", [])
            return [TextContent(type="text", text=f"Group members: {members}")]

        # Application Status Tools
        if name == "authentik_get_application_status":
            app_slug = arguments["app_slug"]
            data = await authentik_client.request("GET", f"/core/applications/{app_slug}/")
            return [TextContent(type="text", text=f"Application status: {data}")]

        if name == "authentik_list_applications_status":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/core/applications/", params=params)
            return [TextContent(type="text", text=f"Applications status: {data}")]

        # Flow Status Tools
        if name == "authentik_get_flow_status":
            flow_slug = arguments["flow_slug"]
            data = await authentik_client.request("GET", f"/flows/instances/{flow_slug}/")
            return [TextContent(type="text", text=f"Flow status: {data}")]

        if name == "authentik_list_flows_status":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/flows/instances/", params=params)
            return [TextContent(type="text", text=f"Flows status: {data}")]

        # System Health Tools
        if name == "authentik_get_system_config":
            data = await authentik_client.request("GET", "/root/config/")
            return [TextContent(type="text", text=f"System configuration: {data}")]

        if name == "authentik_get_version_info":
            try:
                data = await authentik_client.request("GET", "/root/config/")
                version_info = {
                    "version": data.get("version", "unknown"),
                    "build_hash": data.get("build_hash", "unknown"),
                }
                return [TextContent(type="text", text=f"Version information: {version_info}")]
            except Exception:
                return [TextContent(type="text", text="Version information not accessible")]

        # Provider Status Tools
        elif name == "authentik_list_providers_status":
            params = {k: v for k, v in arguments.items() if v is not None}
            data = await authentik_client.request("GET", "/providers/all/", params=params)
            return [TextContent(type="text", text=f"Providers status: {data}")]

        elif name == "authentik_get_provider_status":
            provider_id = arguments["provider_id"]
            data = await authentik_client.request("GET", f"/providers/all/{provider_id}/")
            return [TextContent(type="text", text=f"Provider status: {data}")]

        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

    except Exception as e:
        logger.error(f"Tool call failed: {e!s}")
        return [TextContent(type="text", text=f"Error: {e!s}")]


async def main() -> None:
    """Main entry point for the MCP server."""
    parser = argparse.ArgumentParser(description="Authentik Diagnostic MCP Server")
    parser.add_argument("--base-url", required=True, help="Authentik base URL")
    parser.add_argument("--token", required=True, help="Authentik API token")
    parser.add_argument("--no-verify-ssl", action="store_true", help="Disable SSL verification")

    args = parser.parse_args()

    # Initialize Authentik client
    global authentik_client
    config = AuthentikConfig(
        base_url=args.base_url,
        token=args.token,
        verify_ssl=not args.no_verify_ssl,
    )
    authentik_client = AuthentikClient(config)

    # Test connection
    try:
        await authentik_client.request("GET", "/root/config/")
        logger.info("Successfully connected to Authentik API (diagnostic mode)")
    except Exception as e:
        logger.error(f"Failed to connect to Authentik API: {e}")
        return

    # Run MCP server
    try:
        async with stdio_server() as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="authentik-diag-mcp",
                    server_version="0.1.0",
                    capabilities=server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    ),
                ),
            )
    finally:
        if authentik_client:
            await authentik_client.close()


# --- Ensure main() is always awaited, even if not run as __main__ ---
def run() -> None:
    asyncio.run(main())

if __name__ == "__main__":
    run()
