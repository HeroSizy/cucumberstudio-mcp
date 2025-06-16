import { beforeAll, afterEach, afterAll } from 'vitest'
import { startMockServer, stopMockServer, resetMockServer } from '../mocks/server.js'

// Start the mock server before all tests
beforeAll(() => {
  startMockServer()
})

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  resetMockServer()
})

// Stop the mock server after all tests
afterAll(() => {
  stopMockServer()
})