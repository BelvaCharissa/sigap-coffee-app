# SIGAP Core Service Dockerfile
# Optimized for STB ARM64 and Low-Resource Footprint (< 256MB RAM)
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copy application code
COPY src/ ./src/
COPY data/ ./data/ 2>/dev/null || true

# Environmental configuration
ENV NODE_ENV=production
ENV PORT=3000

# Expose internal port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start microservice
CMD ["node", "src/server.js"]
