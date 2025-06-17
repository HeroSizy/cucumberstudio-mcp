// Export all mock data for easy importing
export * from './projects.js';
export * from './scenarios.js';
export * from './action-words.js';
export * from './test-runs.js';
// Consolidated export for convenience
export const mockData = {
    projects: () => import('./projects.js'),
    scenarios: () => import('./scenarios.js'),
    actionWords: () => import('./action-words.js'),
    testRuns: () => import('./test-runs.js'),
};
//# sourceMappingURL=index.js.map