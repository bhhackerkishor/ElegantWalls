'use client';

import { IoClose } from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export default function Modal({ isOpen, onClose, children, className, size = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background shadow-lg animate-fade-in',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background-secondary border-none cursor-pointer transition-colors hover:bg-accent hover:text-black"
          aria-label="Close"
        >
          <IoClose size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
