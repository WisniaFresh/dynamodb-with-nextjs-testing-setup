import { ReactNode } from 'react';

const Button = ({
  onAction,
  children,
}: {
  onAction: () => void;
  children: ReactNode;
}) => {
  return (
    // Button code
    <button
      onClick={onAction}
      className='inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#F9C784,45%,#F7E7CE,55%,#F9C784)] bg-[length:200%_100%] px-6 font-medium text-stone-900 transition-colors hover:text-white hover:shadow-md hover:shadow-white focus:outline-none'
    >
      {children}
    </button>
  );
};

export default Button;
