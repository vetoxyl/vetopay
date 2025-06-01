import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

const Breadcrumb = ({ items, showHome = true, className }) => {
  return (
    <nav className={clsx('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <div>
              <Link
                to="/"
                className="text-gray-400 hover:text-gray-500"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="sr-only">Home</span>
              </Link>
            </div>
          </li>
        )}
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {item.href ? (
                <Link
                  to={item.href}
                  className={clsx(
                    'ml-2 text-sm font-medium',
                    index === items.length - 1
                      ? 'text-gray-500'
                      : 'text-gray-400 hover:text-gray-500'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={clsx(
                    'ml-2 text-sm font-medium',
                    index === items.length - 1
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 