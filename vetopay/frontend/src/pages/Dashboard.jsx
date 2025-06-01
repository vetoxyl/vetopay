import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWalletStore } from '../store/walletStore'
import { 
  WalletIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PaperAirplaneIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

function Dashboard() {
  const { user } = useAuthStore()
  const { wallet, transactions, getWallet, getTransactions, getTransactionStats } = useWalletStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          getWallet(),
          getTransactions({ limit: 5 }),
          getTransactionStats('month').then(setStats)
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getWallet, getTransactions, getTransactionStats])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/send-money" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Send Money</p>
              <p className="text-lg font-semibold">Quick Transfer</p>
            </div>
          </div>
        </Link>

        <Link to="/wallet" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Add Funds</p>
              <p className="text-lg font-semibold">Top Up Wallet</p>
            </div>
          </div>
        </Link>

        <Link to="/transactions" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">View History</p>
              <p className="text-lg font-semibold">All Transactions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <WalletIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Money Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.sent?.total || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.sent?.count || 0} transactions
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ArrowUpIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Money Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.received?.total || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.received?.count || 0} transactions
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ArrowDownIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Flow</p>
              <p className={`text-2xl font-bold ${
                (stats?.received?.total || 0) - (stats?.sent?.total || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency((stats?.received?.total || 0) - (stats?.sent?.total || 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isSent = transaction.senderWallet.userId === user?.id
              const otherUser = isSent 
                ? transaction.receiverWallet.user 
                : transaction.senderWallet.user

              return (
                <Link
                  key={transaction.id}
                  to={`/transactions/${transaction.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      isSent ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {isSent ? (
                        <ArrowUpIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {isSent ? 'Sent to' : 'Received from'} {otherUser.firstName} {otherUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      isSent ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isSent ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.status.toLowerCase()}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 