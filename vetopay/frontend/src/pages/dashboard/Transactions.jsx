import { useEffect, useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ArrowUpIcon, ArrowDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Transactions() {
  const { user } = useAuthStore();
  const {
    transactions,
    isLoading,
    error,
    getTransactions,
    clearError
  } = useWalletStore();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: '',
    search: ''
  });

  useEffect(() => {
    getTransactions(page, 10, filters);
    // eslint-disable-next-line
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Transactions' }]}
      />
      
      {/* Filters */}
      <Card className="mt-6">
        <Card.Header className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <Card.Title>Filters</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Transaction Type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </Select>

            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </Select>

            <Select
              label="Date Range"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </Select>

            <Input
              label="Search"
              type="text"
              placeholder="Search by ID or description"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Transactions Table */}
      <Card className="mt-6">
        <Card.Header className="flex items-center justify-between">
          <Card.Title>Transaction History</Card.Title>
          <Badge variant="info">{transactions.length} total</Badge>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error" message={error} onClose={clearError} />
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions found.</div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Description</Table.Head>
                  <Table.Head>Reference</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {transactions.map((tx) => {
                  const isSent = tx.senderId === user?.id;
                  const otherUser = isSent ? tx.recipient : tx.sender;

                  return (
                    <Table.Row key={tx.id}>
                      <Table.Cell>
                        {format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a')}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {isSent ? (
                            <ArrowUpIcon className="w-4 h-4 text-red-500" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4 text-green-500" />
                          )}
                          <Badge variant={isSent ? 'danger' : 'success'}>
                            {isSent ? 'Sent' : 'Received'}
                          </Badge>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={isSent ? 'text-red-600' : 'text-green-600'}>
                          {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={
                            tx.status === 'SUCCESS'
                              ? 'success'
                              : tx.status === 'PENDING'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="text-sm text-gray-900">{tx.description || '-'}</p>
                          <p className="text-xs text-gray-500">
                            {isSent ? 'To: ' : 'From: '}
                            {otherUser?.firstName} {otherUser?.lastName}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-mono text-xs text-gray-500">
                          {tx.reference}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
        <Card.Footer className="flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={5} // TODO: Replace with real total pages from API
            onPageChange={setPage}
          />
        </Card.Footer>
      </Card>
    </div>
  );
} 