import { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { UserGroupIcon, BanknotesIcon, DocumentMagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const {
    statistics,
    isLoading,
    error,
    getStatistics,
    getAuditLogs,
    auditLogs,
    clearError
  } = useAdminStore();

  useEffect(() => {
    getStatistics();
    getAuditLogs(1, 5);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-100 to-blue-50">
          <UserGroupIcon className="w-10 h-10 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{statistics?.users ?? '--'}</div>
          <div className="text-gray-600">Total Users</div>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-green-100 to-green-50">
          <BanknotesIcon className="w-10 h-10 text-green-500 mb-2" />
          <div className="text-2xl font-bold">₦{statistics?.totalVolume?.toLocaleString() ?? '--'}</div>
          <div className="text-gray-600">Total Volume</div>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-yellow-100 to-yellow-50">
          <ChartBarIcon className="w-10 h-10 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold">{statistics?.transactions ?? '--'}</div>
          <div className="text-gray-600">Transactions</div>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-indigo-100 to-indigo-50">
          <DocumentMagnifyingGlassIcon className="w-10 h-10 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold">{statistics?.auditLogs ?? '--'}</div>
          <div className="text-gray-600">Audit Logs</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <Card className="flex flex-col items-center justify-center p-6">
          <Card.Title>Manage Users</Card.Title>
          <Card.Description>View, search, and manage all users.</Card.Description>
          <Button as={Link} to="/admin/users" variant="primary" className="mt-4 w-full">Go to Users</Button>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6">
          <Card.Title>Manage Transactions</Card.Title>
          <Card.Description>Review and filter all transactions.</Card.Description>
          <Button as={Link} to="/admin/transactions" variant="primary" className="mt-4 w-full">Go to Transactions</Button>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6">
          <Card.Title>Audit Logs</Card.Title>
          <Card.Description>View system audit logs and activity.</Card.Description>
          <Button as={Link} to="/admin/audit-logs" variant="primary" className="mt-4 w-full">Go to Audit Logs</Button>
        </Card>
      </div>
      <Card className="mt-10">
        <Card.Header>
          <Card.Title>Recent Audit Logs</Card.Title>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error" message={error} onClose={clearError} />
          ) : auditLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No recent audit logs.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <li key={log.id} className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">{log.action}</Badge>
                    <span className="text-gray-800 font-medium">{log.userEmail}</span>
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600 text-sm mt-1">{log.details}</div>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
} 