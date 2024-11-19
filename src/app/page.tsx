import Header from '@/frontend/components/Header';
import { URLS } from '@/frontend/constants/urls';
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <Header title='Welcome to my Next.js App!' />
      <Link href={URLS.dummiesTest} className='text-green-500'>
        Go to dummies test
      </Link>
    </div>
  );
};

export default Home;
