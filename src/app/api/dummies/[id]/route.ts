import { NextResponse } from 'next/server';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';
import { handleApiError } from '@/backend/lib/functions/errorHandler';
import { TABLES } from '@/backend/lib/db/tables';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the ID format (assuming it's a UUID)
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Fetch the item from DynamoDB
    const data = await dynamoDbClient.send(
      new GetCommand({
        TableName: TABLES.dummies,
        Key: { id }, // DynamoDB expects the primary key attribute
      })
    );

    // Check if the item was found
    if (!data.Item) {
      return NextResponse.json({ message: 'Dummy not found' }, { status: 404 });
    }

    return NextResponse.json(data.Item, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
