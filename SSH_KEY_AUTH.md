# SSH Key-Based Authentication Setup

This guide explains how to set up and use key-based SSH authentication with the Mark Board Docker containers.

## Security Configuration

SSH is configured for **key-based authentication only**. Password authentication is disabled.

### SSH Server Configuration

- **Authentication Method**: Public key only
- **Password Authentication**: ❌ Disabled
- **Root Login**: Restricted to key-based auth only
- **Key Types Supported**: ED25519, ECDSA, RSA
- **Ciphers**: Modern, secure algorithms (ChaCha20-Poly1305, AES-GCM)

## Quick Start

### 1. Generate SSH Key (if you don't have one)

```bash
# Generate ED25519 key (recommended - fastest and most secure)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -C "mark-board"

# Or RSA key (if ED25519 not available)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -C "mark-board"

# Follow the prompts:
# - Press Enter for default location
# - Enter passphrase (optional but recommended)
# - Confirm passphrase
```

### 2. Copy Public Key to Container

Option A: Using `docker cp` (easiest for first-time setup)

```bash
# Copy your public key into the container's authorized_keys
docker cp ~/.ssh/id_ed25519.pub mark-board-mark-board-1:/root/.ssh/authorized_keys

# Set proper permissions
docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys
```

Option B: Using SSH (after initial key setup)

```bash
# If you already have SSH access, copy your key
ssh-copy-id -p 2222 -i ~/.ssh/id_ed25519 root@localhost
```

Option C: Manual Volume Setup (Recommended for Development)

Add to `docker-compose.dev.yml`:

```yaml
volumes:
  - ~/.ssh/id_ed25519.pub:/root/.ssh/authorized_keys:ro
```

Then rebuild the container.

### 3. Connect via SSH

```bash
# Using default SSH key
ssh root@localhost -p 2222

# Using specific key
ssh -i ~/.ssh/id_ed25519 root@localhost -p 2222

# With key passphrase (use ssh-agent)
ssh-add ~/.ssh/id_ed25519
ssh root@localhost -p 2222
```

## SSH Configuration

### Add SSH Config Entry

Create or edit `~/.ssh/config`:

```
Host mark-board
    HostName localhost
    Port 2222
    User root
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking accept-new
    UserKnownHostsFile ~/.ssh/known_hosts
```

Then connect simply with:

```bash
ssh mark-board
```

### SSH with SSH Agent

For passphrase-protected keys:

```bash
# Start SSH agent (usually already running on macOS/Linux)
eval "$(ssh-agent -s)"

# Add your key
ssh-add ~/.ssh/id_ed25519

# Now SSH won't prompt for passphrase
ssh mark-board
```

## Multiple SSH Keys

If you have multiple SSH keys, SSH tries them in order. You can specify which key to use:

```bash
# Try specific key first
ssh -i ~/.ssh/id_ed25519 mark-board

# Or update ~/.ssh/config to specify IdentityFile
```

## Container SSH Key Management

### View Authorized Keys in Container

```bash
docker exec mark-board-mark-board-1 cat /root/.ssh/authorized_keys
```

### Add Additional Keys

```bash
# Append new public key
cat ~/.ssh/another_key.pub | \
  docker exec -i mark-board-mark-board-1 \
  bash -c 'cat >> /root/.ssh/authorized_keys'

# Verify permissions
docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys
```

### Remove a Key

```bash
# Edit authorized_keys (remove the line)
docker exec mark-board-mark-board-1 vim /root/.ssh/authorized_keys
```

## SFTP Access

SFTP also uses key-based authentication:

```bash
# Connect via SFTP
sftp -P 2222 root@localhost

# Or using SSH config alias
sftp mark-board
```

SFTP commands:

```
ls              # List files
cd dir          # Change directory
get file        # Download file
put file        # Upload file
mkdir dir       # Create directory
rm file         # Delete file
exit            # Disconnect
```

## IDE Integration

### VS Code Remote SSH

1. Install "Remote - SSH" extension
2. Update `~/.ssh/config` with mark-board entry
3. Click Remote icon in status bar
4. Select "Connect to Host"
5. Choose "mark-board"
6. Enter key passphrase if needed
7. Edit files directly in container!

### JetBrains IDEs (WebStorm, IntelliJ)

1. Go to Settings → Tools → SSH Configurations
2. Click "+" to add new configuration
3. Host: `localhost`
4. Port: `2222`
5. Username: `root`
6. Authentication type: Key pair
7. Private key file: `~/.ssh/id_ed25519`
8. Test Connection
9. Apply changes

### VIM/Neovim Remote Editing

```bash
# Edit files over SSH
vim scp://root@localhost:2222/app/src/components/Board.tsx

# Or use SSH config alias
vim scp://mark-board/app/src/components/Board.tsx
```

## SSH Agent Forwarding (Advanced)

To use your host's SSH keys inside the container for Git operations:

Update `docker-compose.dev.yml`:

```yaml
services:
  mark-board-dev:
    # ... other config ...
    environment:
      - SSH_AUTH_SOCK=/ssh-agent
    volumes:
      - $SSH_AUTH_SOCK:/ssh-agent
```

Then inside container:

```bash
# Your host's SSH keys are available
git clone git@github.com:your-repo.git
```

## Troubleshooting

### Permission Denied (publickey)

```bash
# Check key permissions
ls -la ~/.ssh/
# Should show: -rw------- (600) for private key
# Should show: -rw-r--r-- (644) for public key

# Check authorized_keys in container
docker exec mark-board-mark-board-1 ls -la /root/.ssh/

# Verify SSH config
docker exec mark-board-mark-board-1 cat /etc/ssh/sshd_config | grep -E "PasswordAuth|PubkeyAuth"

# Check SSH logs
docker exec mark-board-mark-board-1 tail -50 /var/log/sshd.out.log
```

### Connection Refused

```bash
# Verify SSH service is running
docker exec mark-board-mark-board-1 ps aux | grep sshd

# Check if port is correct
docker ps | grep mark-board
# Should show: 0.0.0.0:2222->22

# Test SSH daemon config
docker exec mark-board-mark-board-1 sshd -t
```

### SSH Key Not Found

```bash
# List available keys
ssh-add -l

# Add your key to agent
ssh-add ~/.ssh/id_ed25519

# Try connecting again
ssh mark-board
```

### Timeout on Connection

```bash
# Increase SSH timeout
ssh -o ConnectTimeout=10 mark-board

# Or update ~/.ssh/config:
# ConnectTimeout 10

# Check container logs
docker logs mark-board-mark-board-1 | tail -20
```

## Security Best Practices

1. **Use ED25519 keys** - Most secure and efficient

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
   ```

2. **Use key passphrase** - Protects key if file is compromised

   ```bash
   ssh-add ~/.ssh/id_ed25519  # Use with ssh-agent
   ```

3. **Rotate keys regularly** - Generate new keys periodically

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_new
   ```

4. **Limit key access** - Only add keys you trust

   ```bash
   # Verify before adding
   cat ~/.ssh/public_key.pub
   ```

5. **Use SSH config** - Centralized key management

   ```
   # ~/.ssh/config
   Host mark-board
       IdentityFile ~/.ssh/id_ed25519
   ```

6. **Monitor access** - Check SSH logs
   ```bash
   docker exec mark-board-mark-board-1 tail -f /var/log/sshd.out.log
   ```

## Production SSH Setup

For production containers, consider:

1. **Restrict root login** - Use a non-root user

   ```bash
   # Modify sshd_config to use limited user instead of root
   ```

2. **IP Whitelisting** - Use firewall rules

   ```bash
   # Only allow SSH from specific IPs
   ```

3. **SSH Key Rotation** - Regular key maintenance

   ```bash
   # Rotate keys every 3-6 months
   ```

4. **Audit Logging** - Monitor all SSH access
   ```bash
   # Review /var/log/sshd.out.log regularly
   ```

## Commands Reference

```bash
# Generate ED25519 key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

# Copy key to container
docker cp ~/.ssh/id_ed25519.pub mark-board-mark-board-1:/root/.ssh/authorized_keys

# Set permissions
docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys

# Connect via SSH
ssh -p 2222 -i ~/.ssh/id_ed25519 root@localhost

# Using SSH config
ssh mark-board

# SFTP access
sftp mark-board

# View authorized keys
docker exec mark-board-mark-board-1 cat /root/.ssh/authorized_keys

# Check SSH status
docker exec mark-board-mark-board-1 ps aux | grep sshd

# View SSH logs
docker exec mark-board-mark-board-1 tail -f /var/log/sshd.out.log

# Verify SSH config
docker exec mark-board-mark-board-1 sshd -t
```

## Next Steps

1. Generate your SSH key: `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519`
2. Copy it to the container: `docker cp ~/.ssh/id_ed25519.pub mark-board-mark-board-1:/root/.ssh/authorized_keys`
3. Set permissions: `docker exec mark-board-mark-board-1 chmod 600 /root/.ssh/authorized_keys`
4. Connect: `ssh -p 2222 root@localhost`
5. Or add SSH config and use: `ssh mark-board`

Happy secure coding!
