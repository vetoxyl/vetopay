import { useEffect, useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, PaperAirplaneIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const transferSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  description: z.string().max(200, 'Description too long').optional()
});

export default function Wallet() {
  const { user } = useAuthStore();
  const {
    balance,
    transactions,
    isLoading,
    error,
    getBalance,
    getTransactions,
    transferFunds,
    clearError
  } = useWalletStore();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [page, setPage] = useState(1);
  const [transferStatus, setTransferStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: { recipientId: '', amount: '', description: '' }
  });

  useEffect(() => {
    getBalance();
    getTransactions(page, 5);
    // eslint-disable-next-line
  }, [page]);

  const onTransfer = async (data) => {
    setTransferStatus(null);
    const result = await transferFunds(data.recipientId, Number(data.amount), data.description);
    if (result.success) {
      setTransferStatus({ type: 'success', message: 'Transfer successful!' });
      reset();
      getBalance();
      getTransactions(page, 5);
      setTimeout(() => setShowTransferModal(false), 1200);
    } else {
      setTransferStatus({ type: 'error', message: result.error || 'Transfer failed' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Wallet' }]}
      />
      <div className="flex flex-col md:flex-row md:space-x-8 mt-6">
        {/* Wallet Card */}
        <Card className="flex-1 bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg relative overflow-hidden">
          <Card.Header className="flex items-center justify-between">
            <div>
              <Card.Title className="text-white text-2xl font-bold">Wallet Balance</Card.Title>
              <Card.Description className="text-blue-100">{user?.firstName} {user?.lastName}</Card.Description>
            </div>
            <BanknotesIcon className="w-12 h-12 text-blue-200 opacity-80" />
          </Card.Header>
          <Card.Content className="flex flex-col items-start mt-4">
            <span className="text-4xl font-extrabold tracking-tight">₦{balance?.toLocaleString() || '0.00'}</span>
            <Badge variant="success" className="mt-2">Active</Badge>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center"
                onClick={() => setShowTransferModal(true)}
              >
                <PaperAirplaneIcon className="w-5 h-5 mr-1" /> Send Money
              </Button>
              <Button
                variant="success"
                size="sm"
                className="flex items-center"
                // onClick={...} // Fund wallet modal (future)
                disabled
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-1" /> Fund
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex items-center"
                // onClick={...} // Withdraw modal (future)
                disabled
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-1" /> Withdraw
              </Button>
            </div>
          </Card.Content>
        </Card>
        {/* Quick Transfer Modal */}
        <Modal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          title="Send Money"
          size="sm"
        >
          <form onSubmit={handleSubmit(onTransfer)} className="space-y-4">
            <Input
              label="Recipient ID"
              {...register('recipientId')}
              error={errors.recipientId?.message}
              required
              placeholder="Paste recipient's user ID"
            />
            <Input
              label="Amount (₦)"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
              required
              min={1}
              placeholder="Enter amount"
            />
            <Input
              label="Description"
              {...register('description')}
              error={errors.description?.message}
              placeholder="(Optional)"
            />
            {transferStatus && (
              <Alert type={transferStatus.type} message={transferStatus.message} />
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Send
              </Button>
            </div>
          </form>
        </Modal>
      </div>
      {/* Recent Transactions */}
      <Card className="mt-10">
        <Card.Header className="flex items-center justify-between">
          <Card.Title>Recent Transactions</Card.Title>
          <Badge variant="info">{transactions.length} total</Badge>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error" message={error} onClose={clearError} />
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions yet.</div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Description</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {transactions.map((tx) => (
                  <Table.Row key={tx.id}>
                    <Table.Cell>{new Date(tx.createdAt).toLocaleString()}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={tx.type === 'CREDIT' ? 'success' : 'danger'}>
                        {tx.type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={tx.status === 'SUCCESS' ? 'success' : 'warning'}>
                        {tx.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{tx.description || '-'}</Table.Cell>
                  </Table.Row>
                ))}
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