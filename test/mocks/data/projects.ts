export const mockProjects = {
  data: [
    {
      id: '1',
      type: 'projects',
      attributes: {
        name: 'E-commerce Platform',
        description: 'Main e-commerce testing project',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
    },
    {
      id: '2',
      type: 'projects',
      attributes: {
        name: 'Mobile App Backend',
        description: 'API testing for mobile application',
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-20T14:45:00Z',
      },
    },
    {
      id: '3',
      type: 'projects',
      attributes: {
        name: 'Authentication Service',
        description: 'User authentication and authorization testing',
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-25T09:15:00Z',
      },
    },
  ],
}

export const mockProject = {
  data: mockProjects.data[0],
}
