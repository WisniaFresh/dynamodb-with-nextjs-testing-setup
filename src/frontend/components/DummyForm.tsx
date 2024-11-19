import { useForm, SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { DummySchema, DummyType } from '@/schemas/dummySchema';
import { zodResolver } from '@hookform/resolvers/zod';

interface DummyFormProps {
  onSubmit: (data: DummyType) => Promise<void>;
}

const DummyForm: React.FC<DummyFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DummyType>({
    resolver: zodResolver(DummySchema),
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const onSubmitHandler: SubmitHandler<DummyType> = (data) => {
    console.log('onSubmitHandler data ', data);
    setMessage('Submitting...');
    onSubmit(data).finally(() => {
      setMessage('');
      reset();
    });
  };

  return (
    <div className='m-16 mx-auto max-w-md rounded-lg bg-gray-100 p-4 shadow-md'>
      <h2 className='mb-4 text-2xl font-semibold text-gray-800'>
        Create Dummy
      </h2>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className='mb-4'>
          <label className='block text-gray-700'>Name</label>
          <input
            {...register('name')}
            placeholder='Name'
            className='w-full rounded-md border border-gray-300 p-2 text-black'
          />
          {errors.name && (
            <p className='text-sm text-red-500'>{errors.name.message}</p>
          )}
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700'>Description</label>
          <input
            {...register('description')}
            placeholder='Description'
            className='w-full rounded-md border border-gray-300 p-2 text-black'
          />
          {errors.description && (
            <p className='text-sm text-red-500'>{errors.description.message}</p>
          )}
        </div>

        <button
          type='submit'
          className='mt-4 w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-700'
        >
          {message || 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default DummyForm;
