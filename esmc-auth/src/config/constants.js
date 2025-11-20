/**
 * ESMC 3.8 MCP Server Configuration
 */

module.exports = {
  // Authentication URLs (esmc-sdk.com Vercel deployment)
  AUTH_URL: process.env.ESMC_AUTH_URL || 'https://esmc-sdk.com/auth/auth-login',
  API_URL: process.env.ESMC_API_URL || 'https://esmc-sdk.com/api',
  DASHBOARD_URL: process.env.ESMC_DASHBOARD_URL || 'https://esmc-sdk.com/dashboard',

  // MCP Callback Configuration
  CALLBACK_PORT: 37847, // Different from CLI (37846) to avoid conflicts
  CALLBACK_TIMEOUT: 5 * 60 * 1000, // 5 minutes

  // Credential Storage
  CREDENTIALS_PATH: require('path').join(require('os').homedir(), '.esmc', 'credentials.json'),

  // Server Info
  SERVER_NAME: 'esmc-mcp-server',
  SERVER_VERSION: '3.8.0',

  // Feature Tiers (synced with Vercel backend API)
  // Tiers: FREE, PRO, MAX, VIP (standardized across SDK)
  TIER_FEATURES: {
    FREE: {
      intelligence: ['PIU'],
      colonels: ['ALPHA', 'BETA', 'GAMMA'],
      modules: [],
      memory: 'json',
      maxProjects: 1,
      maxHardware: 1,
      redTeaming: false,
      timeMachine: false,
      memoryBank: false,
      echelon: false,
      version: 'ESMC 3.2',
      displayName: 'FREE'
    },
    PRO: {
      intelligence: ['PIU', 'DKI', 'UIP', 'PCA'],
      colonels: ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA'],
      modules: ['ESMC_3.2', 'ESMC_3.3', 'ESMC_3.4', 'ESMC_3.5', 'ESMC_3.7', 'ESMC_3.8'],
      memory: 'json',
      maxProjects: 10,
      maxHardware: 1,
      redTeaming: false,
      timeMachine: true,
      memoryBank: true,
      echelon: true,
      version: 'ESMC 3.7',
      displayName: 'PRO'
    },
    MAX: {
      intelligence: ['PIU', 'DKI', 'UIP', 'PCA', 'ATLAS', 'CUP', 'TBI', 'PFI'],
      colonels: ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA'],
      modules: ['ESMC_3.1', 'ESMC_3.2', 'ESMC_3.3', 'ESMC_3.4', 'ESMC_3.5', 'ESMC_3.6', 'ESMC_3.7', 'ESMC_3.8', 'ESMC_3.9', 'ESMC_3.10', 'ESMC_3.11'],
      memory: 'mysql',
      maxProjects: 999,
      maxHardware: 1,
      redTeaming: true,
      timeMachine: true,
      memoryBank: true,
      echelon: true,
      version: 'ESMC 3.11',
      displayName: 'MAX'
    },
    VIP: {
      intelligence: ['PIU', 'DKI', 'UIP', 'PCA', 'ATLAS', 'CUP', 'TBI', 'PFI'],
      colonels: ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA'],
      modules: ['ESMC_3.1', 'ESMC_3.2', 'ESMC_3.3', 'ESMC_3.4', 'ESMC_3.5', 'ESMC_3.6', 'ESMC_3.7', 'ESMC_3.8', 'ESMC_3.9', 'ESMC_3.10', 'ESMC_3.11'],
      memory: 'mysql',
      maxProjects: 999,
      maxHardware: 1,
      redTeaming: true,
      timeMachine: true,
      memoryBank: true,
      echelon: true,
      version: 'ESMC 3.11',
      displayName: 'VIP'
    }
  }
};
