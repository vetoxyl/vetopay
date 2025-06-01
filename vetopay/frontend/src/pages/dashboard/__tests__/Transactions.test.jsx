import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWalletStore } from '../../../stores/walletStore';
import { useAuthStore } from '../../../stores/authStore';
import Transactions from '../Transactions';

// Mock the stores
jest.mock('../../../stores/walletStore');
jest.mock('../../../stores/authStore');

describe('Transactions Page', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe'
  };

  const mockTransactions = [
    {
      id: '1',
      amount: 1000,
      type: 'CREDIT',
      status: 'SUCCESS',
      description: 'Payment received',
      createdAt: '2024-03-20T10:00:00Z',
      senderId: '2',
      recipientId: '1',
      reference: 'TX123',
      sender: { firstName: 'Jane', lastName: 'Smith' },
      recipient: { firstName: 'John', lastName: 'Doe' }
    },
    {
      id: '2',
      amount: 500,
      type: 'DEBIT',
      status: 'PENDING',
      description: 'Payment sent',
      createdAt: '2024-03-20T11:00:00Z',
      senderId: '1',
      recipientId: '3',
      reference: 'TX124',
      sender: { firstName: 'John', lastName: 'Doe' },
      recipient: { firstName: 'Bob', lastName: 'Johnson' }
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock store implementations
    useAuthStore.mockReturnValue({
      user: mockUser
    });

    useWalletStore.mockReturnValue({
      transactions: mockTransactions,
      isLoading: false,
      error: null,
      getTransactions: jest.fn(),
      clearError: jest.fn()
    });
  });

  it('renders the transactions page with filters', () => {
    render(<Transactions />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // Check if filter inputs are present
    expect(screen.getByLabelText('Transaction Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('displays transactions in the table', () => {
    render(<Transactions />);
    
    // Check if transactions are displayed
    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.getByText('Payment sent')).toBeInTheDocument();
    
    // Check if amounts are formatted correctly
    expect(screen.getByText('+₦1,000.00')).toBeInTheDocument();
    expect(screen.getByText('-₦500.00')).toBeInTheDocument();
  });

  it('applies filters when changed', async () => {
    const mockGetTransactions = jest.fn();
    useWalletStore.mockReturnValue({
      transactions: mockTransactions,
      isLoading: false,
      error: null,
      getTransactions: mockGetTransactions,
      clearError: jest.fn()
    });

    render(<Transactions />);

    // Change type filter
    fireEvent.change(screen.getByLabelText('Transaction Type'), {
      target: { value: 'CREDIT' }
    });

    // Wait for the filter to be applied
    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        type: 'CREDIT'
      }));
    });
  });

  it('shows loading state', () => {
    useWalletStore.mockReturnValue({
      transactions: [],
      isLoading: true,
      error: null,
      getTransactions: jest.fn(),
      clearError: jest.fn()
    });

    render(<Transactions />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state', () => {
    useWalletStore.mockReturnValue({
      transactions: [],
      isLoading: false,
      error: 'Failed to load transactions',
      getTransactions: jest.fn(),
      clearError: jest.fn()
    });

    render(<Transactions />);
    expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    useWalletStore.mockReturnValue({
      transactions: [],
      isLoading: false,
      error: null,
      getTransactions: jest.fn(),
      clearError: jest.fn()
    });

    render(<Transactions />);
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });
}); 