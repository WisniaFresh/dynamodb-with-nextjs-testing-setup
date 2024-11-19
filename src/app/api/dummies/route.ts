import { NextResponse } from 'next/server';
import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';
import { DummySchema } from '@/schemas/dummySchema';
import { handleApiError } from '@/backend/lib/functions/errorHandler';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { TABLES } from '@/backend/lib/db/tables';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const createdAtSort = url.searchParams.get('created_at_sort') || 'asc';

    // DynamoDB doesn't support offset-based pagination, so we use limit and LastEvaluatedKey
    const params = {
      TableName: TABLES.dummies,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status || 'active' },
    };

    // Fetch data from DynamoDB
    const data = await dynamoDbClient.send(new ScanCommand(params));
    console.log(data);

    // parse using zod
    const dummies =
      data.Items?.map((item) => {
        const parsed = DummySchema.safeParse(item);
        return parsed.success ? parsed.data : null;
      }).filter((item) => item !== null) || [];

    console.log('dummies.length', dummies);

    // Sorting (client-side since DynamoDB doesn't support sorting on non-key attributes)
    dummies.sort((a, b) => {
      if (createdAtSort === 'asc') {
        return (
          new Date(a.created_at || '').getTime() -
          new Date(b.created_at || '').getTime()
        );
      } else {
        return (
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
        );
      }
    });

    // Pagination logic using LastEvaluatedKey
    const totalDocuments = dummies.length;
    const totalPages = Math.ceil(totalDocuments / limit);
    const paginatedDummies = dummies.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        dummies: paginatedDummies,
        pagination: {
          page,
          limit,
          totalPages,
          totalDocuments,
          lastEvaluatedKey:
            paginatedDummies.length > 1
              ? paginatedDummies[paginatedDummies.length - 1].id
              : null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = DummySchema.parse({
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
    });

    // Prepare the data for DynamoDB
    const params = {
      TableName: TABLES.dummies,
      Item: {
        ...validatedData,
      },
    };

    // Insert the item into DynamoDB
    const result = await dynamoDbClient.send(new PutCommand(params));

    console.log('result', result);

    return NextResponse.json(
      {
        message: 'Dummy created',
        dummy: validatedData,
        result: result,
        id: validatedData.id,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
