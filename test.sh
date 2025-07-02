#!/bin/bash

# Comprehensive test script for Authentik MCP Server packages
# This script tests both Python and Node.js packages to ensure they build and work correctly

set -e  # Exit on any error

echo "🧪 Running comprehensive tests for Authentik MCP Server packages..."
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    print_status "Running test: $test_name"
    
    if [ -n "$test_dir" ]; then
        cd "$test_dir"
    fi
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((TESTS_PASSED++))
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
    fi
    
    if [ -n "$test_dir" ]; then
        cd - > /dev/null
    fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
print_status "Testing Python packages..."
echo "----------------------------------------"

# Test Python authentik-mcp
run_test "Python authentik-mcp: uv sync" "uv sync" "python/authentik-mcp"
run_test "Python authentik-mcp: build" "uv build" "python/authentik-mcp"
run_test "Python authentik-mcp: syntax check" "uv run python -m py_compile src/authentik_mcp/server.py" "python/authentik-mcp"

# Test Python authentik-diag-mcp
run_test "Python authentik-diag-mcp: uv sync" "uv sync" "python/authentik-diag-mcp"
run_test "Python authentik-diag-mcp: build" "uv build" "python/authentik-diag-mcp"
run_test "Python authentik-diag-mcp: syntax check" "uv run python -m py_compile src/authentik_diag_mcp/server.py" "python/authentik-diag-mcp"

echo ""
print_status "Testing Node.js packages..."
echo "----------------------------------------"

# Test Node.js authentik-mcp
run_test "Node.js authentik-mcp: npm install" "npm install" "nodejs/authentik-mcp"
run_test "Node.js authentik-mcp: TypeScript build" "npm run build" "nodejs/authentik-mcp"
run_test "Node.js authentik-mcp: lint check" "npm run lint" "nodejs/authentik-mcp"

# Test Node.js authentik-diag-mcp
run_test "Node.js authentik-diag-mcp: npm install" "npm install" "nodejs/authentik-diag-mcp"
run_test "Node.js authentik-diag-mcp: TypeScript build" "npm run build" "nodejs/authentik-diag-mcp"
run_test "Node.js authentik-diag-mcp: lint check" "npm run lint" "nodejs/authentik-diag-mcp"

echo ""
print_status "Testing documentation and configuration..."
echo "----------------------------------------"

# Test documentation files exist and are readable
run_test "README.md exists" "test -f README.md"
run_test "USAGE.md exists" "test -f USAGE.md"
run_test "CONTRIBUTING.md exists" "test -f CONTRIBUTING.md"
run_test "SECURITY.md exists" "test -f SECURITY.md"
run_test "LICENSE exists" "test -f LICENSE"
run_test ".env.example exists" "test -f .env.example"

# Test CI/CD configuration
run_test "CI/CD workflow exists" "test -f .github/workflows/ci-cd.yml"

# Test build scripts
run_test "build.sh is executable" "test -x build.sh"
run_test "publish.sh is executable" "test -x publish.sh"

# Test example files
run_test "Examples directory exists" "test -d examples"
run_test "Python setup example exists" "test -f examples/setup_claude_desktop.py"
run_test "Node.js setup example exists" "test -f examples/setup_nodejs.js"

echo ""
print_status "Testing package structures..."
echo "----------------------------------------"

# Test Python package structures
run_test "Python authentik-mcp structure" "test -f python/authentik-mcp/src/authentik_mcp/__init__.py && test -f python/authentik-mcp/src/authentik_mcp/server.py"
run_test "Python authentik-diag-mcp structure" "test -f python/authentik-diag-mcp/src/authentik_diag_mcp/__init__.py && test -f python/authentik-diag-mcp/src/authentik_diag_mcp/server.py"

# Test Node.js package structures
run_test "Node.js authentik-mcp structure" "test -f nodejs/authentik-mcp/src/index.ts && test -f nodejs/authentik-mcp/package.json"
run_test "Node.js authentik-diag-mcp structure" "test -f nodejs/authentik-diag-mcp/src/index.ts && test -f nodejs/authentik-diag-mcp/package.json"

echo ""
print_status "Testing build artifacts..."
echo "----------------------------------------"

# Test that built files exist
run_test "Python authentik-mcp dist exists" "test -d python/authentik-mcp/dist"
run_test "Python authentik-diag-mcp dist exists" "test -d python/authentik-diag-mcp/dist"
run_test "Node.js authentik-mcp build exists" "test -d nodejs/authentik-mcp/dist"
run_test "Node.js authentik-diag-mcp build exists" "test -d nodejs/authentik-diag-mcp/dist"

echo ""
print_status "Testing configuration files..."
echo "----------------------------------------"

# Test configuration file syntax
run_test "Python authentik-mcp pyproject.toml syntax" "python -c 'import tomllib; tomllib.load(open(\"python/authentik-mcp/pyproject.toml\", \"rb\"))'"
run_test "Python authentik-diag-mcp pyproject.toml syntax" "python -c 'import tomllib; tomllib.load(open(\"python/authentik-diag-mcp/pyproject.toml\", \"rb\"))'"
run_test "Node.js authentik-mcp package.json syntax" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"nodejs/authentik-mcp/package.json\"))'"
run_test "Node.js authentik-diag-mcp package.json syntax" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"nodejs/authentik-diag-mcp/package.json\"))'"

echo ""
echo "=================================================================="
print_status "Test Summary"
echo "=================================================================="

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All tests passed! ✅ ($TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)))"
    echo ""
    echo "🎉 Your Authentik MCP Server packages are ready for publication!"
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'Complete Authentik MCP implementation'"
    echo "2. Tag a release: git tag v0.1.0"
    echo "3. Push to repository: git push && git push --tags"
    echo "4. Publish packages: ./publish.sh"
    echo ""
else
    print_error "Some tests failed! ❌ ($TESTS_PASSED passed, $TESTS_FAILED failed)"
    echo ""
    echo "Please review the failed tests and fix any issues before publication."
    exit 1
fi

echo "🔍 Package Information:"
echo "----------------------------------------"
echo "Python packages:"
echo "  - authentik-mcp (full API): Ready for PyPI"
echo "  - authentik-diag-mcp (diagnostic): Ready for PyPI"
echo ""
echo "Node.js packages:"
echo "  - authentik-mcp (full API): Ready for npm"
echo "  - authentik-diag-mcp (diagnostic): Ready for npm"
echo ""
echo "📚 Documentation:"
echo "  - README.md: Main project documentation"
echo "  - USAGE.md: Usage instructions and examples"
echo "  - CONTRIBUTING.md: Contribution guidelines"
echo "  - SECURITY.md: Security policy and guidelines"
echo "  - examples/: Setup scripts and examples"
echo ""
echo "🛠️  Development:"
echo "  - build.sh: Build all packages"
echo "  - publish.sh: Publish all packages"
echo "  - .github/workflows/ci-cd.yml: Automated CI/CD"
echo ""

exit 0
