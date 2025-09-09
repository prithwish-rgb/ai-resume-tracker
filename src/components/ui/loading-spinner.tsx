import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-[#6C63FF]",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn("text-gray-600", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

export const PageLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6C63FF]/5 via-[#00C9A7]/5 to-[#6C63FF]/5">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const ButtonLoading: React.FC = () => (
  <LoadingSpinner size="sm" className="mr-2" />
);

export default LoadingSpinner;
