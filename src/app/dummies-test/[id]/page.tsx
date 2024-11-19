import { dynamoDbClient } from '@/backend/lib/db/dynamoDbClient';
import { TABLES } from '@/backend/lib/db/tables';
import BackButton from '@/frontend/components/BackButton';
import { DummySchema, DummyType } from '@/schemas/dummySchema';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

async function fetchDummy(id: string): Promise<DummyType | null> {
  const result = await dynamoDbClient.send(
    new GetCommand({
      TableName: TABLES.dummies,
      Key: { id }, // DynamoDB expects the primary key attribute
    })
  );

  // Check if the item exists
  if (!result.Item) {
    return null;
  }

  // Use safeParse to validate the result
  const parsed = DummySchema.safeParse(result.Item);
  return parsed.success ? parsed.data : null;
}

async function fetchFirst10Dummies(): Promise<DummyType[] | null> {
  const params = {
    TableName: TABLES.dummies,
    Limit: 10,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'active' },
  };

  //fetch
  const result = await dynamoDbClient.send(new ScanCommand(params));

  // Validate using safeParse and filter out invalid items
  const items =
    result.Items?.map((item) => {
      const parsed = DummySchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    }).filter((item): item is DummyType => item !== null) || [];

  return items.length > 0 ? items : null;
}

export const revalidate = 60 * 60 * 12; // 12 hours

export async function generateStaticParams() {
  const dummiesFirst10 = await fetchFirst10Dummies();
  console.log('dummiesFirst10', dummiesFirst10);

  if (dummiesFirst10) {
    return dummiesFirst10.map((dummy) => {
      return { id: dummy.id };
    });
  }
}

const DummyDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  console.log('id', id);

  const dummy = await fetchDummy(id);

  console.log('dummy', dummy);

  if (!dummy) {
    return <p className='text-center text-gray-500'>Loading...</p>;
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center bg-gray-900 p-6'>
      <div className='flex w-full flex-col items-start bg-gray-900 p-6'>
        <BackButton />
      </div>
      <h1 className='mb-8 text-4xl font-bold text-blue-600'>Dummy Details</h1>

      <div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Name:</h2>
          <p className='text-2xl font-bold text-gray-700'>{dummy.name}</p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Description:</h2>
          <p className='text-lg text-gray-700'>{dummy.description}</p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Status:</h2>
          <p
            className={`text-lg font-semibold ${
              dummy.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {dummy.status === 'active' ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Created At:</h2>
          <p className='text-lg text-gray-600'>
            {new Date(dummy.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DummyDetailPage;
