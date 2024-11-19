import React from 'react';

interface PaginationProps {
  currentPage: number;
  maxPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  maxPages,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < maxPages) onPageChange(currentPage + 1);
  };

  return (
    <div className='flex items-center space-x-4 p-4'>
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`rounded p-2 ${currentPage === 1 ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'}`}
      >
        ←
      </button>
      <span className='text-lg font-semibold'>
        Page {currentPage} / {maxPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === maxPages}
        className={`rounded p-2 ${currentPage === maxPages ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'}`}
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
