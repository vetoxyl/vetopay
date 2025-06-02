# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and generate package-lock.json
RUN npm install && \
    npm install --package-lock-only

# Copy source code
COPY src/ ./src/

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source code from builder stage
# (No longer copying from a 'dist' folder, as we are not compiling TypeScript)
COPY --from=builder /app/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application
# (Running directly from 'src' as it's JavaScript)
CMD ["node", "src/server.js"] 