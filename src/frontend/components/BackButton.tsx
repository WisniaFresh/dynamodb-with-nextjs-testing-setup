'use client';

import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className='mb-6 flex items-start text-blue-500 hover:underline'
    >
      <span className='mr-2'>←</span> Go Back
    </button>
  );
};

export default BackButton;
