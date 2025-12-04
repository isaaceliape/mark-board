# Mark Board Docker - SSH Access Guide

Your Docker image now includes SSH server access alongside the Nginx web server.

## Image Details

- **Image**: `mark-board:latest`
- **Size**: 163MB (Ubuntu-based with nginx + SSH)
- **Web Port**: 80 (HTTP)
- **SSH Port**: 22 (default)

## Quick Start

### Option 1: SSH with Password Authentication (Quick Start)

```bash
# Run the container
docker run -d -p 8080:80 -p 2222:22 --name mark-board mark-board:latest

# SSH into the container
ssh -p 2222 root@localhost

# Default password prompt will appear
# (no password is set by default, you'll need to create one inside the container)
```

### Option 2: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Then SSH in:
```bash
ssh -p 2222 root@localhost
```

## SSH Access Methods

### Method 1: SSH Key-Based Authentication (Recommended)

This is more secure than password authentication.

```bash
# Copy your SSH public key into the container
docker cp ~/.ssh/id_rsa.pub mark-board:/root/.ssh/authorized_keys

# Set proper permissions
docker exec mark-board chmod 600 /root/.ssh/authorized_keys

# Now SSH without a password
ssh -p 2222 root@localhost
```

### Method 2: Interactive SSH Access

```bash
# Start the container
docker run -it -p 8080:80 -p 2222:22 mark-board:latest

# From another terminal, set a root password
docker exec -it mark-board passwd

# SSH in
ssh -p 2222 root@localhost
```

### Method 3: Using docker-compose with SSH Key Mounting

Edit `docker-compose.yml` to uncomment the volumes section:

```yaml
version: '3.8'

services:
  mark-board:
    build: .
    ports:
      - '8080:80'
      - '2222:22'
    environment:
      - VITE_BASE=/
    volumes:
      - ~/.ssh/id_rsa.pub:/root/.ssh/authorized_keys:ro
```

Then:
```bash
docker-compose up -d
ssh -p 2222 root@localhost
```

## Port Mapping Reference

When using Docker, you might map ports differently:

```bash
# Map port 2222 on host to 22 in container
docker run -p 2222:22 mark-board:latest

# Then SSH on port 2222
ssh -p 2222 root@localhost

# Or use a different host port
docker run -p 3333:22 mark-board:latest
ssh -p 3333 root@localhost
```

## Accessing the Web Application

The Nginx server runs alongside SSH:

- **HTTP**: `http://localhost:8080` (if mapped to 8080)
- **SSH**: `ssh -p 2222 root@localhost`

Both services run simultaneously thanks to supervisord.

## Inside the Container

Once connected via SSH:

```bash
# Web root directory
cd /var/www/html

# Check nginx status
supervisorctl status

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/sshd.log
```

## Troubleshooting

### Connection refused on SSH
```bash
# Verify container is running
docker ps | grep mark-board

# Check SSH service
docker exec mark-board supervisorctl status sshd

# View SSH logs
docker logs mark-board
```

### Can't authenticate with SSH key
```bash
# Verify key permissions
docker exec mark-board ls -la /root/.ssh/

# Should show: -rw------- (600 permissions)
docker exec mark-board chmod 600 /root/.ssh/authorized_keys
```

### Connection refused on HTTP
```bash
# Verify nginx is running
docker exec mark-board supervisorctl status nginx

# Check nginx logs
docker exec mark-board tail -f /var/log/nginx/error.log
```

## Security Considerations

1. **Use SSH Keys**: Always use key-based authentication instead of passwords
2. **Change Default SSH Config**: Modify `/etc/ssh/sshd_config` for production
3. **Use a Non-Root User**: Create additional users instead of using root
4. **Firewall**: Only expose SSH on trusted networks
5. **Keep Updated**: Regularly rebuild the image to get security patches

## Creating Additional Users

```bash
# SSH into container
ssh -p 2222 root@localhost

# Create a new user
useradd -m -s /bin/bash appuser
passwd appuser

# Add to sudoers (optional)
usermod -aG sudo appuser

# Copy SSH keys for the new user
mkdir -p /home/appuser/.ssh
cp /root/.ssh/authorized_keys /home/appuser/.ssh/
chown -R appuser:appuser /home/appuser/.ssh
chmod 700 /home/appuser/.ssh
chmod 600 /home/appuser/.ssh/authorized_keys
```

## Docker Compose with Environment Variables

```yaml
version: '3.8'

services:
  mark-board:
    build: .
    ports:
      - '8080:80'
      - '2222:22'
    environment:
      - VITE_BASE=/
      - VITE_OPENROUTER_API_KEY=your_key_here
    volumes:
      - ~/.ssh/id_rsa.pub:/root/.ssh/authorized_keys:ro
```

## Stopping and Cleaning Up

```bash
# Stop the container
docker stop mark-board

# Remove the container
docker rm mark-board

# Stop docker-compose services
docker-compose down
```
