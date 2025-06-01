import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      required = false,
      options = [],
      placeholder,
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
        <select
          ref={ref}
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select; 