import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'block w-full rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 transition-colors',
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
            id={error ? `${props.id}-error` : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 