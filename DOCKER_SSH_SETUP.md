# Docker SSH Configuration - Setup Summary

Your Mark Board Docker image has been successfully configured with SSH access alongside the web server.

## ✅ What's Been Done

1. **Updated Dockerfile** - Added Ubuntu 22.04 base with nginx, OpenSSH, and supervisor
2. **Created supervisord.conf** - Configured to run both nginx and SSH services
3. **Updated docker-compose.yml** - Added SSH port mapping (2222:22)
4. **Built Docker Image** - `mark-board:latest` (163MB)
5. **Verified Services** - Both nginx (HTTP) and sshd (SSH) confirmed running

## 🚀 Quick Start

### Start the Container

```bash
docker compose up -d
```

This starts both services:
- **Web**: `http://localhost:8080`
- **SSH**: `ssh -p 2222 root@localhost`

### SSH Access Options

#### Option 1: Password Authentication (Quick Test)
```bash
# Set a password for root user (run once)
docker exec mark-board-mark-board-1 bash -c 'echo "root:yourpassword" | chpasswd'

# SSH in
ssh -p 2222 root@localhost
```

#### Option 2: SSH Key Authentication (Recommended)
```bash
# Copy your SSH public key
docker cp ~/.ssh/id_rsa.pub mark-board-mark-board-1:/root/.ssh/authorized_keys

# Set proper permissions
docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys

# SSH in (no password needed)
ssh -p 2222 root@localhost
```

#### Option 3: Use docker-compose with Key Mounting
Edit `docker-compose.yml` to uncomment the volumes section, then:

```bash
docker compose up -d
ssh -p 2222 root@localhost
```

## 📋 Service Configuration

### Running Services

Both services are managed by **supervisord**:

```bash
# Check service status
docker exec mark-board-mark-board-1 ps aux | grep -E "nginx|sshd|supervisor"
```

Expected output:
- `supervisord` - Process manager (PID 1)
- `nginx` - Web server with worker processes
- `sshd` - SSH server daemon

### Ports

- **8080** → 80 (HTTP to Nginx)
- **2222** → 22 (SSH to OpenSSH)

Change in `docker-compose.yml` if needed:
```yaml
ports:
  - '8080:80'    # Change 8080 to your preferred port
  - '2222:22'    # Change 2222 to your preferred port
```

## 🔒 Security Setup

### Create Non-Root User (Recommended)

```bash
ssh -p 2222 root@localhost

# Inside container:
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
passwd appuser

# Copy SSH keys for non-root user
mkdir -p /home/appuser/.ssh
cp /root/.ssh/authorized_keys /home/appuser/.ssh/
chown -R appuser:appuser /home/appuser/.ssh
chmod 700 /home/appuser/.ssh
chmod 600 /home/appuser/.ssh/authorized_keys
```

Then SSH as non-root:
```bash
ssh -p 2222 appuser@localhost
```

### SSH Configuration

Edit `/etc/ssh/sshd_config` inside container for production settings:

```bash
ssh -p 2222 root@localhost
vim /etc/ssh/sshd_config
```

Common security settings to consider:
- `PasswordAuthentication no` (key-only)
- `PermitRootLogin no` (disable root login)
- `Port 22` (or custom port)
- `PubkeyAuthentication yes` (enable key auth)

Then restart SSH:
```bash
supervisorctl restart sshd
```

## 📁 File Access

Once connected via SSH, you can access the web files:

```bash
ssh -p 2222 root@localhost

# Web root directory
cd /var/www/html

# List files
ls -la

# Edit files
vim index.html

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/sshd.log
```

## 🛠️ Troubleshooting

### SSH Connection Refused

```bash
# Verify container is running
docker ps | grep mark-board

# Check SSH is listening
docker exec mark-board-mark-board-1 netstat -tuln | grep 22

# Check sshd process
docker exec mark-board-mark-board-1 ps aux | grep sshd

# View SSH logs
docker logs mark-board-mark-board-1 2>&1 | grep ssh
```

### Can't SSH with Key

```bash
# Verify key permissions (should be 600)
docker exec mark-board-mark-board-1 ls -la /root/.ssh/authorized_keys

# Fix permissions
docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys

# Try verbose SSH to see why it fails
ssh -v -p 2222 root@localhost
```

### HTTP Access Not Working

```bash
# Check nginx is running
docker exec mark-board-mark-board-1 ps aux | grep nginx

# Check nginx logs
docker exec mark-board-mark-board-1 tail -f /var/log/nginx/error.log

# Verify port mapping
docker port mark-board-mark-board-1
```

### Both Services Stopped

```bash
# Check supervisord status
docker logs mark-board-mark-board-1

# Restart container
docker compose restart

# Or full restart
docker compose down && docker compose up -d
```

## 📦 Files Modified/Created

- ✏️ **Dockerfile** - Updated with SSH and supervisor
- ✨ **supervisord.conf** - New service manager config
- ✏️ **docker-compose.yml** - Added SSH port mapping
- 📖 **SSH_ACCESS.md** - Detailed SSH guide (already exists)

## 🎯 Next Steps

1. **Test SSH Connection**: `ssh -p 2222 root@localhost`
2. **Add Your SSH Key**: Follow Option 2 above
3. **Create Non-Root User**: For production use
4. **Configure SSH**: Customize `/etc/ssh/sshd_config` as needed
5. **Access Web Files**: Edit files directly via SSH

## 💡 Tips

- Use SCP to transfer files: `scp -P 2222 file.txt root@localhost:/tmp/`
- Mount volumes for persistent data: Add to docker-compose.yml
- Port forward from production server: `ssh -L 8080:localhost:8080 user@server`
- Use SFTP client (FileZilla, WinSCP) to browse files with GUI

## 📝 Environment Setup Examples

```bash
# Copy entire project directory into container
docker cp ./src root@localhost:/var/www/html/

# Set environment variables
docker exec mark-board-mark-board-1 export MY_VAR=value

# Run commands inside container
docker exec mark-board-mark-board-1 bash -c 'npm run build'

# Install additional packages
docker exec mark-board-mark-board-1 apt-get update && apt-get install -y curl
```
