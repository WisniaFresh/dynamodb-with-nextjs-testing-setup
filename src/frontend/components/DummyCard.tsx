import { DummyType } from '@/schemas/dummySchema';
import { URLS } from '@/frontend/constants/urls';

interface DummyCardProps {
  dummy: DummyType;
}

const DummyCard: React.FC<DummyCardProps> = ({ dummy }) => {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
      <h2 className='text-xl font-bold text-gray-800'>{dummy.name}</h2>
      <p className='mt-2 text-gray-600'>
        {dummy.description || 'No description provided.'}
      </p>
      <span
        className={`mt-3 inline-block rounded-full px-2 py-1 text-sm font-semibold ${
          dummy.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {dummy.status === 'active' ? 'Active' : 'Inactive'}
      </span>
      <p className='mt-3 text-sm text-gray-500'>
        Created on: {new Date(dummy.created_at || '').toLocaleString()}
      </p>

      <div className='mt-4 flex justify-center'>
        <a
          data-testid={`check-button-${String(dummy.id)}`}
          href={URLS.dummyTest(String(dummy.id))}
          className='rounded-md bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600'
        >
          Check
        </a>
      </div>
    </div>
  );
};

export default DummyCard;
