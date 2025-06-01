import { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const sendSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  description: z.string().max(200, 'Description too long').optional()
});

export default function SendMoney() {
  const { user } = useAuthStore();
  const {
    transactions,
    isLoading,
    error,
    transferFunds,
    getTransactions,
    clearError
  } = useWalletStore();

  const [transferStatus, setTransferStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(sendSchema),
    defaultValues: { recipientId: '', amount: '', description: '' }
  });

  const onSend = async (data) => {
    setTransferStatus(null);
    const result = await transferFunds(data.recipientId, Number(data.amount), data.description);
    if (result.success) {
      setTransferStatus({ type: 'success', message: 'Money sent successfully!' });
      reset();
      getTransactions(1, 5);
    } else {
      setTransferStatus({ type: 'error', message: result.error || 'Transfer failed' });
    }
  };

  // Show only recent outgoing transfers
  const recentTransfers = transactions.filter(
    (tx) => tx.type === 'DEBIT' && tx.senderId === user?.id
  ).slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Send Money' }]}
      />
      <Card className="mt-6">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <PaperAirplaneIcon className="w-6 h-6 text-blue-500" /> Send Money
          </Card.Title>
          <Card.Description>Transfer funds instantly to another user.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSend)} className="space-y-4">
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
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <PaperAirplaneIcon className="w-5 h-5 mr-1" /> Send
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
      <Card className="mt-8">
        <Card.Header>
          <Card.Title>Recent Transfers</Card.Title>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error" message={error} onClose={clearError} />
          ) : recentTransfers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No recent transfers.</div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Recipient</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Description</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {recentTransfers.map((tx) => (
                  <Table.Row key={tx.id}>
                    <Table.Cell>{new Date(tx.createdAt).toLocaleString()}</Table.Cell>
                    <Table.Cell className="font-mono text-xs text-gray-500">{tx.recipientId}</Table.Cell>
                    <Table.Cell>
                      <span className="text-red-600">-₦{tx.amount.toLocaleString()}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={tx.status === 'SUCCESS' ? 'success' : tx.status === 'FAILED' ? 'danger' : 'warning'}>
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
      </Card>
    </div>
  );
} 