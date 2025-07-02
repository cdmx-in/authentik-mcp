# Contributing to Authentik MCP Servers

Thank you for your interest in contributing to the Authentik MCP Servers project! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Python 3.10+ with uv installed
- Node.js 18+ with npm
- Git

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/authentik-mcp.git
cd authentik-mcp
```

2. Set up Python development environment:
```bash
cd python/authentik-mcp
uv sync --dev
cd ../authentik-diag-mcp
uv sync --dev
```

3. Set up Node.js development environment:
```bash
cd nodejs/authentik-mcp
npm install
cd ../authentik-diag-mcp
npm install
```

4. Run tests and linting:
```bash
# Python
./build.sh

# Individual package testing
cd python/authentik-mcp && uv run ruff check src/ && uv run mypy src/
cd python/authentik-diag-mcp && uv run ruff check src/ && uv run mypy src/

# Node.js
cd nodejs/authentik-mcp && npm run lint && npm run build
cd nodejs/authentik-diag-mcp && npm run lint && npm run build
```

## Code Style

### Python
- Follow PEP 8 style guidelines
- Use `ruff` for linting and formatting
- Use `mypy` for type checking
- Use meaningful variable and function names
- Add docstrings to all public functions and classes

### Node.js/TypeScript
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Use meaningful variable and function names
- Add JSDoc comments to all public functions and classes
- Prefer `async/await` over Promises

## Project Structure

```
authentik-mcp/
├── python/
│   ├── authentik-mcp/          # Full API package
│   └── authentik-diag-mcp/     # Diagnostic package
├── nodejs/
│   ├── authentik-mcp/          # Full API package
│   └── authentik-diag-mcp/     # Diagnostic package
├── .github/workflows/          # CI/CD workflows
├── build.sh                    # Build all packages
├── publish.sh                  # Publish all packages
└── docs/                       # Documentation
```

## Adding New Features

### Adding New Tools

1. **For Python packages:**
   - Add tool implementation in `src/{package_name}/server.py`
   - Update the `get_available_tools()` method
   - Add the tool handler to the server

2. **For Node.js packages:**
   - Add tool implementation in `src/index.ts`
   - Update the tools list in the server setup
   - Add the tool handler

### Adding New Resources

1. Follow the same pattern as tools
2. Ensure resources provide useful information about Authentik state
3. Add appropriate error handling

## Testing

Currently, the project uses basic build testing. For comprehensive testing:

1. **Unit Tests**: Add tests for individual functions
2. **Integration Tests**: Test against actual Authentik instances
3. **MCP Protocol Tests**: Ensure MCP protocol compliance

### Test Structure (Future)
```
tests/
├── unit/
│   ├── test_tools.py
│   └── test_resources.py
├── integration/
│   └── test_authentik_api.py
└── fixtures/
    └── sample_responses.json
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/new-feature`
3. **Make** your changes following the code style guidelines
4. **Test** your changes thoroughly
5. **Update** documentation if needed
6. **Commit** your changes with clear commit messages
7. **Push** to your fork and **submit** a pull request

### Commit Message Format
```
type(scope): brief description

Longer description if needed

- List any breaking changes
- Reference any issues fixed (#123)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Documentation

- Update README.md for any new features or changes
- Update USAGE.md for new usage patterns
- Add inline code documentation
- Update API documentation if applicable

## Questions or Issues?

- Check existing [Issues](https://github.com/yourusername/authentik-mcp/issues)
- Create a new issue with detailed description
- Join discussions in existing issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
