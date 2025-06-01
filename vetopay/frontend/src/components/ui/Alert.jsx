import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
  showIcon = true
}) => {
  const variants = {
    success: {
      icon: CheckCircleIcon,
      styles: 'bg-green-50 text-green-800 border-green-200'
    },
    error: {
      icon: XCircleIcon,
      styles: 'bg-red-50 text-red-800 border-red-200'
    },
    warning: {
      icon: ExclamationCircleIcon,
      styles: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    },
    info: {
      icon: InformationCircleIcon,
      styles: 'bg-blue-50 text-blue-800 border-blue-200'
    }
  };

  const { icon: Icon, styles } = variants[type];

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        styles,
        className
      )}
      role="alert"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {message && (
            <div className="mt-2 text-sm">{message}</div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600':
                      type === 'success',
                    'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600':
                      type === 'error',
                    'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600':
                      type === 'warning',
                    'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600':
                      type === 'info'
                  }
                )}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 