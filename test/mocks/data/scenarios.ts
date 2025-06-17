export const mockScenarios = [
  {
    id: 1,
    name: 'User Login',
    description: 'Test successful user login flow',
    project_id: 1,
    folder_id: null,
    tags: ['authentication', 'login', 'critical'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Product Search',
    description: 'Search for products in catalog',
    project_id: 1,
    folder_id: 10,
    tags: ['search', 'catalog', 'core'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-16T11:30:00Z',
  },
  {
    id: 3,
    name: 'Checkout Process',
    description: 'Complete purchase flow',
    project_id: 1,
    folder_id: 11,
    tags: ['checkout', 'payment', 'critical'],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-17T12:30:00Z',
  },
]

export const mockFolders = [
  {
    id: 10,
    name: 'Core Features',
    project_id: 1,
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 11,
    name: 'Payment Flow',
    project_id: 1,
    parent_id: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

export const mockScenario = mockScenarios[0]