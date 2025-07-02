#!/bin/bash
set -e

echo "Building Authentik MCP Server packages..."

# Build Python packages using uv
echo "Building Python packages..."

cd python/authentik-mcp
echo "Building authentik-mcp..."
uv build
echo "✓ authentik-mcp built successfully"

cd ../authentik-diag-mcp
echo "Building authentik-diag-mcp..."
uv build
echo "✓ authentik-diag-mcp built successfully"

cd ../../

# Build Node.js packages
echo "Building Node.js packages..."

cd nodejs/authentik-mcp
echo "Building authentik-mcp (Node.js)..."
npm install
npm run build
echo "✓ authentik-mcp (Node.js) built successfully"

cd ../authentik-diag-mcp
echo "Building authentik-diag-mcp (Node.js)..."
npm install
npm run build
echo "✓ authentik-diag-mcp (Node.js) built successfully"

cd ../../

echo ""
echo "All packages built successfully!"
echo ""
echo "Python packages:"
echo "- python/authentik-mcp/dist/"
echo "- python/authentik-diag-mcp/dist/"
echo ""
echo "Node.js packages:"
echo "- nodejs/authentik-mcp/dist/"
echo "- nodejs/authentik-diag-mcp/dist/"
echo ""
echo "Ready for publishing!"