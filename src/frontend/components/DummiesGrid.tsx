import DummyCard from './DummyCard';
import { DummyType } from '@/schemas/dummySchema';

interface DummiesGridProps {
  dummies: DummyType[];
}

const DummiesGrid: React.FC<DummiesGridProps> = ({ dummies }) => {
  return (
    <div className='mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {dummies.slice(0, 9).map((dummy) => (
        <DummyCard key={dummy.id} dummy={dummy} />
      ))}
    </div>
  );
};

export default DummiesGrid;
