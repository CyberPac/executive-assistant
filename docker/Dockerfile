# Personal Executive Assistant (PEA) System - Production Dockerfile
# LEASA v2.0 Architecture with 15-Agent Orchestration

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pea -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --chown=pea:nodejs --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p logs performance-logs benchmarks/results && \
    chown -R pea:nodejs logs performance-logs benchmarks

# Switch to non-root user
USER pea

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Environment variables
ENV NODE_ENV=production
ENV PEA_ENV=production
ENV PEA_AGENTS=15
ENV PEA_TOPOLOGY=hierarchical

# Start the application
CMD ["node", "dist/index.js"]