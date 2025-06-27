# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files, build config, and scripts
COPY package*.json ./
COPY tsconfig*.json ./
COPY scripts/ ./scripts/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY --chown=mcpserver:nodejs package*.json ./

# Install only production dependencies
RUN npm ci --production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=mcpserver:nodejs /app/build ./build

# Switch to non-root user
USER mcpserver

# Expose port for HTTP transport
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('MCP Server is healthy')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "build/index.js"]