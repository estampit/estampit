import * as React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const variants: Record<string,string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-600',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-purple-500'
};

export const Button: React.FC<ButtonProps> = ({ variant='primary', loading=false, className, children, ...rest }) => {
  return (
    <button
      className={clsx(base, variants[variant], className, loading && 'relative')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </span>
      )}
      <span className={clsx(loading && 'opacity-0')}>{children}</span>
    </button>
  );
};

export default Button;
