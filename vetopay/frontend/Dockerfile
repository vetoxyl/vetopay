# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# ---- Add these lines for debugging ----
RUN echo "--- Listing /app/src/pages ---" && ls -R /app/src/pages
RUN echo "--- Listing /app/src/pages/admin ---" && ls -R /app/src/pages/admin || echo "Admin directory not found or empty"
# ------------------------------------

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 