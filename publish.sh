#!/bin/bash
set -e

echo "Publishing Authentik MCP Server packages..."

# Publish Python packages to PyPI
echo "Publishing Python packages to PyPI..."

cd python/authentik-mcp
echo "Publishing authentik-mcp to PyPI..."
uv publish
echo "✓ authentik-mcp published to PyPI"

cd ../authentik-diag-mcp
echo "Publishing authentik-diag-mcp to PyPI..."
uv publish
echo "✓ authentik-diag-mcp published to PyPI"

cd ../../

# Publish Node.js packages to npm
echo "Publishing Node.js packages to npm..."

cd nodejs/authentik-mcp
echo "Publishing authentik-mcp to npm..."
npm publish
echo "✓ authentik-mcp published to npm"

cd ../authentik-diag-mcp
echo "Publishing authentik-diag-mcp to npm..."
npm publish
echo "✓ authentik-diag-mcp published to npm"

cd ../../

echo ""
echo "All packages published successfully!"
echo ""
echo "Python packages (PyPI):"
echo "- pip install authentik-mcp"
echo "- pip install authentik-diag-mcp"
echo ""
echo "Node.js packages (npm):"
echo "- npm install -g authentik-mcp"
echo "- npm install -g authentik-diag-mcp"
echo "- npx authentik-mcp"
echo "- npx authentik-diag-mcp"