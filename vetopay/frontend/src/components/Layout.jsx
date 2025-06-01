import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import {
  HomeIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

function Layout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount, getUnreadCount } = useNotificationStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getUnreadCount()
  }, [getUnreadCount])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Wallet', href: '/wallet', icon: WalletIcon },
    { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Send Money', href: '/send-money', icon: PaperAirplaneIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'All Transactions', href: '/admin/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Wallets', href: '/admin/wallets', icon: WalletIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">VetoPay</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Admin Navigation */}
            {user?.role === 'ADMIN' && (
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </h3>
                <div className="mt-2 space-y-1">
                  {adminNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-1 text-gray-400 hover:text-gray-500"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6 text-gray-500" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <NavLink
                to="/notifications"
                className="relative p-2 text-gray-400 hover:text-gray-500"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellSolidIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  </>
                ) : (
                  <BellIcon className="h-6 w-6" />
                )}
              </NavLink>

              {/* User role badge */}
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout 