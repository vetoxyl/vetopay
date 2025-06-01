import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className,
  contentClassName
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <Popover className={clsx('relative inline-block', className)}>
      {({ open }) => (
        <>
          <Popover.Button
            className={clsx(
              'focus:outline-none',
              open && 'ring-2 ring-blue-500 ring-offset-2'
            )}
          >
            {children}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={clsx(
                'absolute z-10',
                positions[position],
                contentClassName
              )}
            >
              <div className="relative rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
                {content}
                <div
                  className={clsx('absolute w-2 h-2 bg-gray-900 transform rotate-45', {
                    'bottom-[-4px] left-1/2 -translate-x-1/2': position === 'top',
                    'top-[-4px] left-1/2 -translate-x-1/2': position === 'bottom',
                    'right-[-4px] top-1/2 -translate-y-1/2': position === 'left',
                    'left-[-4px] top-1/2 -translate-y-1/2': position === 'right'
                  })}
                />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default Tooltip; 