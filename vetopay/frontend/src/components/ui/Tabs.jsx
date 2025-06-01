import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

const Tabs = ({ tabs, onChange, defaultIndex = 0, className }) => {
  return (
    <Tab.Group onChange={onChange} defaultIndex={defaultIndex}>
      <Tab.List
        className={clsx(
          'flex space-x-1 rounded-xl bg-gray-100 p-1',
          className
        )}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            {tab.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {tabs.map((tab) => (
          <Tab.Panel
            key={tab.id}
            className={clsx(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs; 