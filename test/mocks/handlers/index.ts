import { projectHandlers } from './projects.js'
import { scenarioHandlers } from './scenarios.js'
import { actionWordHandlers } from './action-words.js'
import { testRunHandlers } from './test-runs.js'

// Combine all handlers
export const handlers = [
  ...projectHandlers,
  ...scenarioHandlers,
  ...actionWordHandlers,
  ...testRunHandlers,
]

// Export individual handler groups for selective testing
export {
  projectHandlers,
  scenarioHandlers,
  actionWordHandlers,
  testRunHandlers,
}