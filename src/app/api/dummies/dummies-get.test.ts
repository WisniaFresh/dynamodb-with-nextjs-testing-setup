import { GET } from '@/app/api/dummies/route';
import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handleApiError } from '@/backend/lib/functions/errorHandler';
import { NextResponse } from 'next/server';
import { TABLES } from '@/backend/lib/db/tables';

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ScanCommand: jest.fn(),
}));

jest.mock('@/backend/lib/db/dynamoDbClient', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
}));

jest.mock('@/backend/lib/functions/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

describe('GET /api/dummies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockItems = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Dummy 1',
      description: 'Description 1',
      status: 'active',
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Dummy 2',
      description: 'Description 2',
      status: 'active',
      created_at: '2024-01-02T10:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Dummy 3',
      description: 'Description 3',
      status: 'inactive',
      created_at: '2024-01-03T10:00:00Z',
    },
  ];

  it('should return paginated dummies sorted by created_at in ascending order', async () => {
    const mockRequest = {
      url: 'http://localhost/api/dummies?page=1&limit=2&status=active&created_at_sort=asc',
    } as Request;

    (dynamoDbClient.send as jest.Mock).mockResolvedValue({
      Items: mockItems,
      LastEvaluatedKey: 'last-key',
    });

    const response = await GET(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      dummies: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Dummy 1',
          description: 'Description 1',
          status: 'active',
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Dummy 2',
          description: 'Description 2',
          status: 'active',
          created_at: '2024-01-02T10:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 2,
        totalPages: 2,
        totalDocuments: 3,
        lastEvaluatedKey: '00000000-0000-0000-0000-000000000002',
      },
    });

    expect(dynamoDbClient.send).toHaveBeenCalledWith(
      new ScanCommand({
        TableName: TABLES.dummies,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'active' },
      })
    );
  });

  it('should return paginated dummies sorted by created_at in descending order', async () => {
    const mockRequest = {
      url: 'http://localhost/api/dummies?page=1&limit=2&status=inactive&created_at_sort=desc',
    } as Request;

    (dynamoDbClient.send as jest.Mock).mockResolvedValue({
      Items: mockItems,
      LastEvaluatedKey: 'last-key',
    });

    const response = await GET(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      dummies: [
        {
          id: '00000000-0000-0000-0000-000000000003',
          name: 'Dummy 3',
          description: 'Description 3',
          status: 'inactive',
          created_at: '2024-01-03T10:00:00Z',
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Dummy 2',
          description: 'Description 2',
          status: 'active',
          created_at: '2024-01-02T10:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 2,
        totalPages: 2,
        totalDocuments: 3,
        lastEvaluatedKey: '00000000-0000-0000-0000-000000000002',
      },
    });
  });

  it('should handle DynamoDB errors gracefully', async () => {
    const mockRequest = {
      url: 'http://localhost/api/dummies?page=1&limit=2&status=active',
    } as Request;

    const mockError = new Error('DynamoDB error');
    (dynamoDbClient.send as jest.Mock).mockRejectedValue(mockError);
    (handleApiError as jest.Mock).mockReturnValue(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );

    const response = await GET(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({ error: 'Internal server error' });
    expect(handleApiError).toHaveBeenCalledWith(mockError);
  });

  it('should return an empty array and correct pagination for no results', async () => {
    const mockRequest = {
      url: 'http://localhost/api/dummies?page=1&limit=2&status=nonexistent',
    } as Request;

    (dynamoDbClient.send as jest.Mock).mockResolvedValue({
      Items: [],
      LastEvaluatedKey: null,
    });

    const response = await GET(mockRequest);
    const jsonResponse = await response.json(); // Ensure this is only called once

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      dummies: [],
      pagination: {
        page: 1,
        limit: 2,
        totalPages: 0,
        totalDocuments: 0,
        lastEvaluatedKey: null,
      },
    });
  });
});
