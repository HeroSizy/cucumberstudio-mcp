export const mockActionWords = [
    {
        id: 1,
        name: 'Login with username and password',
        description: 'Authenticate user with provided credentials',
        project_id: 1,
        tags: ['authentication', 'login'],
        parameters: [
            { name: 'username', type: 'string' },
            { name: 'password', type: 'string' },
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
    },
    {
        id: 2,
        name: 'Search for product',
        description: 'Search for a product in the catalog',
        project_id: 1,
        tags: ['search', 'catalog'],
        parameters: [{ name: 'product_name', type: 'string' }],
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-16T11:30:00Z',
    },
    {
        id: 3,
        name: 'Add product to cart',
        description: 'Add a product to shopping cart',
        project_id: 1,
        tags: ['cart', 'shopping'],
        parameters: [
            { name: 'product_id', type: 'number' },
            { name: 'quantity', type: 'number' },
        ],
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-17T12:30:00Z',
    },
];
export const mockActionWord = mockActionWords[0];
//# sourceMappingURL=action-words.js.map