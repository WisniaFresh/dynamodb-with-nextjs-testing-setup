import { GET } from '@/app/api/dummies/[id]/route';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';
import { handleApiError } from '@/backend/lib/functions/errorHandler';
import { NextResponse } from 'next/server';
import { TABLES } from '@/backend/lib/db/tables';

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  GetCommand: jest.fn(),
}));

jest.mock('@/backend/lib/db/dynamoDbClient', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
}));

jest.mock('@/backend/lib/functions/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

describe('GET /api/dummies/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the item if it exists in DynamoDB', async () => {
    const mockRequest = {} as Request;

    const mockItem = {
      id: 'valid-uuid',
      name: 'Test Dummy',
      description: 'A dummy for testing',
      status: 'active',
    };

    // Mock DynamoDB to return an item
    (dynamoDbClient.send as jest.Mock).mockResolvedValue({ Item: mockItem });

    const response = await GET(mockRequest, { params: { id: 'valid-uuid' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual(mockItem);

    expect(dynamoDbClient.send).toHaveBeenCalledWith(
      new GetCommand({
        TableName: TABLES.dummies,
        Key: { id: 'valid-uuid' },
      })
    );
  });

  it('should return 400 if the ID format is invalid', async () => {
    const mockRequest = {} as Request; // Empty request since params are passed directly

    const response = await GET(mockRequest, { params: { id: '' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(400);
    expect(jsonResponse).toEqual({
      message: 'Invalid ID format',
    });

    expect(dynamoDbClient.send).not.toHaveBeenCalled();
  });

  it('should return 404 if the item is not found in DynamoDB', async () => {
    const mockRequest = {} as Request;

    // Mock DynamoDB to return no item
    (dynamoDbClient.send as jest.Mock).mockResolvedValue({ Item: null });

    const response = await GET(mockRequest, { params: { id: 'valid-uuid' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(404);
    expect(jsonResponse).toEqual({
      message: 'Dummy not found',
    });

    expect(dynamoDbClient.send).toHaveBeenCalledWith(
      new GetCommand({
        TableName: TABLES.dummies,
        Key: { id: 'valid-uuid' },
      })
    );
  });

  it('should handle DynamoDB errors gracefully', async () => {
    const mockRequest = {} as Request;

    const mockError = new Error('DynamoDB error');
    (dynamoDbClient.send as jest.Mock).mockRejectedValue(mockError);
    (handleApiError as jest.Mock).mockReturnValue(
      NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    );

    const response = await GET(mockRequest, { params: { id: 'valid-uuid' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({
      message: 'Internal server error',
    });

    expect(dynamoDbClient.send).toHaveBeenCalledWith(
      new GetCommand({
        TableName: TABLES.dummies,
        Key: { id: 'valid-uuid' },
      })
    );

    expect(handleApiError).toHaveBeenCalledWith(mockError);
  });
});
