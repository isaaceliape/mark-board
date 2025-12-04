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

# Production stage with SSH - using Ubuntu for better SSH support
FROM ubuntu:22.04

# Install nginx, SSH server, and supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    openssh-server \
    openssh-sftp-server \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create SSH directories
RUN mkdir -p /run/sshd /root/.ssh && \
    chmod 700 /root/.ssh

# Generate SSH host keys
RUN ssh-keygen -A

# Create supervisord config directory
RUN mkdir -p /etc/supervisor/conf.d

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Configure nginx - remove default configs and use custom one
RUN rm -rf /etc/nginx/sites-enabled/* /etc/nginx/sites-available/* /etc/nginx/conf.d/*

# Copy optimized nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create document root and verify nginx config
RUN mkdir -p /var/www/html && \
    nginx -t

# Copy built files to nginx root
COPY --from=builder /app/docs /var/www/html

# Expose ports (80 for HTTP, 22 for SSH)
EXPOSE 80 22

# Health check - verify services are running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/index.html || exit 1

# Start supervisord to manage both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]