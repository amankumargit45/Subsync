import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'Payment Received', desc: '₹8,100 from Vikram Patel for INV-10002', time: '10m ago', unread: true, link: '/invoices/inv-10002' },
  { id: '2', title: 'Upcoming Renewal', desc: 'Arjun Mehta (PM Team) renews in 3 days', time: '1h ago', unread: true, link: '/subscriptions/sub-10006' },
  { id: '3', title: 'Invoice Overdue', desc: 'INV-10008 for Deepa Krishnan is overdue', time: '4h ago', unread: true, link: '/invoices/inv-10008' },
  { id: '4', title: 'Quotation Approved', desc: 'Amit Deshmukh confirmed QT-10001', time: '1d ago', unread: false, link: '/quotations' },
];

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white dark:ring-surface-900" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-900 rounded-xl shadow-xl border border-surface-200 dark:border-surface-800 py-2 z-50">
          <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider">
              Notifications ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setNotifications(notifications.map(n => n.id === item.id ? { ...n, unread: false } : n));
                  setOpen(false);
                  navigate(item.link);
                }}
                className={`p-3 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors ${item.unread ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-surface-900 dark:text-surface-100">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-surface-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

