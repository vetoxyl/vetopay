import { clsx } from 'clsx';

const Table = ({ className, children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx('min-w-full divide-y divide-gray-200', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ className, children, ...props }) => {
  return (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ className, children, ...props }) => {
  return (
    <tbody
      className={clsx('bg-white divide-y divide-gray-200', className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

const TableRow = ({ className, children, ...props }) => {
  return (
    <tr
      className={clsx('hover:bg-gray-50 transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ className, children, ...props }) => {
  return (
    <th
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ className, children, ...props }) => {
  return (
    <td
      className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}
      {...props}
    >
      {children}
    </td>
  );
};

const TableFooter = ({ className, children, ...props }) => {
  return (
    <tfoot className="bg-gray-50" {...props}>
      {children}
    </tfoot>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Footer = TableFooter;

export default Table; 