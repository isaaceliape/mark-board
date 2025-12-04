# Development Setup with Docker

This guide explains how to set up and use the Mark Board application in development mode using Docker.

## Quick Start

### Option 1: Development Container (Recommended)

The development container includes hot-reload, all development tools, and SSH access.

```bash
# Start the development container
docker compose -f docker-compose.dev.yml up -d

# Access the dev server
open http://localhost:5173

# Connect via SSH
ssh -p 2222 root@localhost
```

### Option 2: Local Development

For traditional local development without Docker:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# The app will be available at http://localhost:5173
```

## Development Container Features

### Services

- **Vite Dev Server** (port 5173)
  - Hot module reloading (HMR)
  - Fast refresh on file changes
  - Real-time TypeScript checking

- **SSH Server** (port 2222)
  - Connect to container for file editing
  - SFTP access for remote file operations
  - Persistent SSH keys across restarts

### Volumes

- **Source Code** (`.:/app`)
  - All source files mounted from host
  - Changes reflected immediately in dev server
  - node_modules kept separate to prevent conflicts

- **kanban-data**
  - Persists board state and user stories
  - Survives container restarts

- **SSH Keys**
  - Persists SSH authentication keys
  - Enables consistent SSH access

## Development Workflow

### 1. Edit Files

Edit files on your host machine in your preferred editor/IDE.

```bash
# Example: Edit a component
vim src/components/Board.tsx
```

### 2. See Changes Immediately

The Vite dev server automatically reloads the page when you save files.

```bash
# Save file → Browser auto-updates
# No need to restart anything
```

### 3. Run Tests

```bash
# Inside the container
docker compose -f docker-compose.dev.yml exec mark-board-dev bun test

# Or on host
bun test
```

### 4. Build and Lint

```bash
# Build for production
docker compose -f docker-compose.dev.yml exec mark-board-dev bun run build

# Run linter
docker compose -f docker-compose.dev.yml exec mark-board-dev bun run lint

# Format code
docker compose -f docker-compose.dev.yml exec mark-board-dev bun run format:fix
```

## SSH Access

### Connect to Container

```bash
ssh -p 2222 root@localhost
```

### Set Password (optional)

```bash
docker compose -f docker-compose.dev.yml exec mark-board-dev bash -c 'echo "root:your-password" | chpasswd'
```

### Copy SSH Key

```bash
# Generate key on host (if you don't have one)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

# Copy to container (requires password initially)
ssh-copy-id -p 2222 -i ~/.ssh/id_ed25519 root@localhost
```

### SFTP Access

```bash
sftp -P 2222 root@localhost
```

## Managing the Development Container

### View Logs

```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f mark-board-dev
```

### Stop Container

```bash
docker compose -f docker-compose.dev.yml down
```

### Rebuild Container

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

### Access Container Shell

```bash
docker compose -f docker-compose.dev.yml exec mark-board-dev bash
```

## Available Commands

Inside the container or on your host, you can run:

```bash
# Development
bun run dev        # Start dev server with hot-reload
bun run build      # Build for production
bun run preview    # Preview production build locally

# Testing & Quality
bun test                  # Run all tests
bun test --watch         # Run tests in watch mode
bun test --coverage      # Generate coverage report
bun run lint             # Check code quality
bun run format:fix       # Auto-format code

# Other
bun run server     # Start backend server
bun run dev:full   # Run both server and dev server
bun install        # Install/update dependencies
```

## Production vs Development

### Production Container (`docker-compose.yml`)

- Optimized Nginx web server
- Built static files only
- Smaller image size (~163MB)
- Port 8080 (HTTP) + 2222 (SSH)
- Health checks included
- Use for: Deployments, demonstrations

### Development Container (`docker-compose.dev.yml`)

- Bun dev server with hot-reload
- Full source code included
- Larger image size (with node_modules)
- Port 5173 (Vite) + 2222 (SSH)
- Development tools included
- Use for: Development, testing, debugging

## Troubleshooting

### Dev server not responding

```bash
# Restart the container
docker compose -f docker-compose.dev.yml restart mark-board-dev

# Check logs
docker compose -f docker-compose.dev.yml logs mark-board-dev
```

### Port already in use

```bash
# Change ports in docker-compose.dev.yml
# Or kill the process using the port
lsof -ti:5173 | xargs kill -9
```

### SSH connection refused

```bash
# Verify container is running
docker ps | grep mark-board-dev

# Check SSH service
docker compose -f docker-compose.dev.yml exec mark-board-dev service ssh status
```

### Files not syncing from host

```bash
# Verify volume mount
docker inspect mark-board-dev-mark-board-dev-1 --format='{{json .Mounts}}' | jq '.'

# Rebuild container
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

## IDE Integration

### VS Code Remote SSH

1. Install "Remote - SSH" extension
2. Add to `~/.ssh/config`:

```
Host mark-board-dev
    HostName localhost
    User root
    Port 2222
```

3. Connect via Command Palette: "Remote-SSH: Connect to Host"
4. Edit files directly in the container

### VIM/Neovim Remote

```bash
# Edit files over SSH
vim scp://root@localhost:2222/app/src/components/Board.tsx
```

## Next Steps

1. Start the dev container: `docker compose -f docker-compose.dev.yml up -d`
2. Open http://localhost:5173 in your browser
3. Make changes to source files
4. Watch the browser auto-update!

Happy coding!
