# Local Development Environment Setup

This guide ensures your local development environment matches the GitHub Actions CI environment exactly.

## Environment Specifications

- **Node.js**: 18.x (exact match with CI)
- **npm**: >=9.0.0
- **OS**: Ubuntu Latest (CI) / Any (Local with Docker)
- **Package Manager**: npm (using `npm ci` for consistency)

## Quick Setup Options

### Option 1: Automated Setup Script (Recommended)

```bash
# Make script executable and run
chmod +x scripts/setup-dev-env.sh
./scripts/setup-dev-env.sh
```

This script will:
- Install Node.js 18 via nvm
- Install dependencies with `npm ci` (same as CI)
- Run type checking, linting, and build (same as CI pipeline)

### Option 2: Docker Development Environment

```bash
# Build and run development container
cd docker
docker-compose -f docker-compose.dev.yml up --build

# Access the container
docker exec -it pea-dev-environment bash
```

### Option 3: Manual Setup

1. **Install Node.js 18**:
   ```bash
   # If you have nvm
   nvm install 18
   nvm use 18
   
   # Or download from nodejs.org
   # Ensure you get version 18.x
   ```

2. **Verify versions**:
   ```bash
   node --version  # Should show v18.x.x
   npm --version   # Should show 9.x.x or higher
   ```

3. **Install dependencies (CI way)**:
   ```bash
   npm ci  # Uses package-lock.json exactly like CI
   ```

4. **Run CI checks locally**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

## Environment Files Created

- **`.nvmrc`**: Specifies Node.js 18 for automatic nvm switching
- **`package.json` engines**: Updated to require Node.js 18.x
- **`scripts/setup-dev-env.sh`**: Automated setup script
- **`docker/Dockerfile.dev`**: Development Docker container
- **`docker/docker-compose.dev.yml`**: Docker Compose for development

## Verification Commands

After setup, verify your environment matches CI:

```bash
# Check versions (should match CI)
node --version    # v18.x.x
npm --version     # 9.x.x+

# Run same commands as CI pipeline
npm ci            # Install dependencies
npm run typecheck # TypeScript checking
npm run lint      # ESLint checking  
npm run build     # Build the project

# Optional: Run tests (when available)
npm run test      # Unit tests
npm run test:agents # Agent validation tests
```

## Switching Between Node Versions

If you need to use different Node.js versions for other projects:

```bash
# Switch to Node.js 18 for this project
nvm use 18

# Or if you have .nvmrc (automatic)
nvm use

# Switch to other versions for other projects
nvm use 20  # or any other version
```

## Common Issues & Solutions

### Issue: Different module resolution behavior
**Solution**: Always use Node.js 18 exactly as CI does

### Issue: Package installation differences  
**Solution**: Use `npm ci` instead of `npm install` for consistency

### Issue: Build/type checking failures
**Solution**: Ensure you're using the exact same Node.js version (18.x)

### Issue: Docker permission issues
**Solution**: The Dockerfile creates a non-root user automatically

## CI Pipeline Matching

Your local environment now matches the GitHub Actions CI pipeline:

- ✅ **Node.js Version**: 18.x (exact match)
- ✅ **Package Installation**: `npm ci` (lockfile-based)
- ✅ **Build Process**: Same TypeScript configuration
- ✅ **Linting**: Same ESLint rules
- ✅ **Type Checking**: Same TypeScript settings

## Next Steps

1. Use the setup script to configure your environment
2. Always use `nvm use 18` when working on this project
3. Use `npm ci` instead of `npm install` for consistency
4. Run the same CI checks locally before pushing changes

Your local environment will now behave identically to the GitHub Actions CI environment, preventing CI failures due to environment differences.