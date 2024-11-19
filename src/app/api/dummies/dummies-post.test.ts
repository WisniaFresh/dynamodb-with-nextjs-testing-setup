import { POST } from '@/app/api/dummies/route';
import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn(),
}));

jest.mock('@/backend/lib/db/dynamoDbClient', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-uuid'),
}));

// Helper function to create a mock Request object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockRequest = (body: any) => {
  return {
    json: async () => body,
  } as Request;
};

describe('POST /api/dummies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a new dummy entry', async () => {
    const mockBody = {
      name: 'Test Dummy',
      description: 'This is a test description',
      status: 'active',
    };

    const mockRequest = createMockRequest(mockBody);
    (dynamoDbClient.send as jest.Mock).mockResolvedValue({});

    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    // Use Jest matchers to handle dynamic fields
    expect(response.status).toBe(201);
    expect(jsonResponse).toEqual({
      message: 'Dummy created',
      dummy: expect.objectContaining({
        id: expect.any(String), // Allow any valid UUID
        name: 'Test Dummy',
        description: 'This is a test description',
        status: 'active',
        created_at: expect.any(String), // Allow any string (timestamp)
      }),
      result: expect.any(Object),
      id: expect.any(String), // Allow any valid UUID
    });
  });

  it('should return a 400 status if validation fails', async () => {
    const invalidBody = {
      name: '', // Invalid name (empty)
      status: 'active',
    };

    const mockRequest = createMockRequest(invalidBody);

    // Capture the response
    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    // Check the response status and message
    expect(response.status).toBe(400);
    expect(jsonResponse.message).toEqual(
      'Validation failed, correct the form and please try again.'
    );

    // Ensure DynamoDB is not called due to validation failure
    expect(dynamoDbClient.send).not.toHaveBeenCalled();
  });

  it('should handle DynamoDB errors gracefully', async () => {
    const mockBody = {
      name: 'Test Dummy',
      description: 'This is a test description',
      status: 'active',
    };

    const mockRequest = createMockRequest(mockBody);
    const error = new Error('DynamoDB error');
    (dynamoDbClient.send as jest.Mock).mockRejectedValue(error);

    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({
      message: 'Internal server error, sth is wrong.',
    });
  });
});
