# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Set base path for production build
ENV VITE_BASE=/

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build the app
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/docs /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]