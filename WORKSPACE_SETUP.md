# MindSnap Workspace Setup

This repository uses npm workspaces to manage multiple packages: frontend, agent, and web3.

## Workspace Structure

```
mindsnap/
├── frontend/          # Next.js frontend application
├── agent/            # Python AI agent backend
├── web3/             # Hardhat smart contracts
├── package.json      # Root workspace configuration
├── vercel.json       # Vercel deployment configuration
└── workspace.config.js # Workspace development configuration
```

## Quick Start

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install specific workspace
npm install --workspace=@mindsnap/frontend
npm install --workspace=@mindsnap/agent
npm install --workspace=@mindsnap/web3
```

### 2. Development

```bash
# Start frontend development server
npm run dev

# Start all services (frontend + socket server)
npm run dev:all

# Start specific workspace
npm run dev --workspace=@mindsnap/frontend
npm run dev --workspace=@mindsnap/agent
npm run dev --workspace=@mindsnap/web3
```

### 3. Build

```bash
# Build all workspaces
npm run build:all

# Build specific workspace
npm run build --workspace=@mindsnap/frontend
npm run build --workspace=@mindsnap/web3
```

## Workspace Details

### Frontend (@mindsnap/frontend)
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Port**: 3000
- **Build**: `next build`

### Agent (@mindsnap/agent)
- **Language**: Python
- **Dependencies**: See `requirements.txt`
- **Port**: 8000 (if running as API)
- **Build**: No build step required

### Web3 (@mindsnap/web3)
- **Framework**: Hardhat
- **Language**: Solidity + TypeScript
- **Port**: 8545 (local blockchain)
- **Build**: `hardhat compile`

## Vercel Deployment

The workspace is configured for Vercel deployment:

1. **Build Command**: `npm run build` (builds frontend)
2. **Install Command**: `npm install` (installs all workspace dependencies)
3. **Output Directory**: `frontend/.next`

### Vercel Configuration

- The `vercel.json` file specifies the build configuration
- Only the frontend is deployed to Vercel
- Agent and Web3 packages are included for dependency management

## Development Workflow

### Adding Dependencies

```bash
# Add to specific workspace
npm install package-name --workspace=@mindsnap/frontend

# Add to all workspaces
npm install package-name --workspaces
```

### Running Scripts

```bash
# Run script in specific workspace
npm run script-name --workspace=@mindsnap/frontend

# Run script in all workspaces
npm run script-name --workspaces
```

### Linking Between Workspaces

Workspaces are automatically linked. You can reference other workspaces in package.json:

```json
{
  "dependencies": {
    "@mindsnap/agent": "workspace:*",
    "@mindsnap/web3": "workspace:*"
  }
}
```

## Environment Setup

### Python (Agent)
```bash
cd agent
pip install -r requirements.txt
```

### Node.js
- Node.js 18+ required
- npm 8+ required

### Hardhat (Web3)
```bash
cd web3
npm install
```

## Troubleshooting

### Workspace Issues
```bash
# Clean all node_modules
rm -rf node_modules frontend/node_modules agent/node_modules web3/node_modules
npm install

# Reset workspace links
npm run clean
npm install
```

### Build Issues
```bash
# Clean builds
npm run clean --workspaces
npm run build:all
```

### Vercel Deployment Issues
1. Ensure `vercel.json` is in root directory
2. Check that build command points to frontend
3. Verify all dependencies are in package.json

## Scripts Reference

### Root Scripts
- `npm run dev` - Start frontend development
- `npm run dev:all` - Start frontend + socket server
- `npm run build` - Build frontend
- `npm run build:all` - Build all workspaces
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean all builds

### Frontend Scripts
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Agent Scripts
- `npm run start` - Start Python agent
- `npm run install-deps` - Install Python dependencies
- `npm run test` - Run Python tests

### Web3 Scripts
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy contracts
- `npm run node` - Start local blockchain 