import { setupServer } from 'msw/node'

import { handlers } from './handlers/index.js'

// Create and export the mock server
export const mockServer = setupServer(...handlers)

// Helper functions for test setup
export const startMockServer = () => {
  mockServer.listen({
    onUnhandledRequest: 'warn', // Warn about unhandled requests
  })
}

export const stopMockServer = () => {
  mockServer.close()
}

export const resetMockServer = () => {
  mockServer.resetHandlers()
}

// Export handlers for selective testing
export { handlers } from './handlers/index.js'
export * from './handlers/index.js'
export * from './data/index.js'