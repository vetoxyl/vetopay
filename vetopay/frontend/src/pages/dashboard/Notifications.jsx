import { useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationStore();

  useEffect(() => {
    getNotifications(1, 20);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
      />
      <Card className="mt-6">
        <Card.Header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="w-6 h-6 text-blue-500" />
            <Card.Title>Notifications</Card.Title>
            <Badge variant="info">{unreadCount} unread</Badge>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckIcon className="w-4 h-4 mr-1" /> Mark all as read
          </Button>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error" message={error} onClose={clearError} />
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No notifications yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 py-4 px-2 rounded-lg transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{n.title || 'Notification'}</span>
                      {!n.read && <Badge variant="primary" size="sm">New</Badge>}
                    </div>
                    <div className="text-gray-700 mt-1">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {!n.read && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => markAsRead(n.id)}
                      >
                        <CheckIcon className="w-4 h-4 mr-1" /> Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteNotification(n.id)}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
} 