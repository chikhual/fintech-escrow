import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import axios from 'axios';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (message: string, severity?: AlertColor) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Cargar notificaciones al inicializar
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.pagination.unreadCount);
    } catch (error: any) {
      console.error('Error cargando notificaciones:', error);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, severity: AlertColor = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marcando notificación como leída:', error);
      showNotification('Error al marcar notificación como leída', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      showNotification('Todas las notificaciones marcadas como leídas', 'success');
    } catch (error: any) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      showNotification('Error al marcar notificaciones como leídas', 'error');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Actualizar contador de no leídas
      const deletedNotification = notifications.find(notif => notif._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      showNotification('Notificación eliminada', 'success');
    } catch (error: any) {
      console.error('Error eliminando notificación:', error);
      showNotification('Error al eliminar notificación', 'error');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Snackbar para notificaciones temporales */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};
