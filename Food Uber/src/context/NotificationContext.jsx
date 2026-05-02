import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState(Notification.permission);

  // Request browser permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => setPermission(p));
    }
  }, []);

  const addNotification = useCallback(({ title, message, type = 'info' }) => {
    const id = Date.now();
    setNotifications(prev => [{ id, title, message, type, read: false, time: new Date() }, ...prev].slice(0, 20));

    // Fire browser push notification
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/vite.svg',
          badge: '/vite.svg',
        });
      } catch (e) { /* silently fail if blocked */ }
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, unreadCount, permission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
