module.exports = {
  // Workspace configuration for MindSnap
  workspaces: {
    frontend: {
      path: './frontend',
      build: 'npm run build',
      dev: 'npm run dev',
      port: 3000
    },
    agent: {
      path: './agent',
      build: 'npm run build',
      dev: 'npm run dev',
      port: 8000
    },
    web3: {
      path: './web3',
      build: 'npm run build',
      dev: 'npm run node',
      port: 8545
    }
  },
  
  // Shared configuration
  shared: {
    nodeVersion: '18.x',
    packageManager: 'npm'
  },
  
  // Build configuration for Vercel
  vercel: {
    buildCommand: 'npm run build',
    installCommand: 'npm install',
    outputDirectory: 'frontend/.next'
  }
}; 