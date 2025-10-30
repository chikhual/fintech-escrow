import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import {
  Notifications,
  MarkEmailRead,
  Delete,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Info,
  AccountBalance,
  Payment,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
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

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loading 
  } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      handleMenuClose();
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      handleMenuClose();
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <AccountBalance color="primary" />;
      case 'payment':
        return <Payment color="success" />;
      case 'document':
        return <Description color="info" />;
      case 'system':
        return <Info color="info" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Notifications color="default" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'loan':
        return 'primary';
      case 'payment':
        return 'success';
      case 'document':
        return 'info';
      case 'system':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX');
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'loan':
        return 'Préstamo';
      case 'payment':
        return 'Pago';
      case 'document':
        return 'Documento';
      case 'system':
        return 'Sistema';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Notificaciones
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              color="error"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={handleMarkAllAsRead}
          >
            Marcar Todas como Leídas
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {notifications.length > 0 ? (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'bold',
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={getNotificationTypeText(notification.type)}
                            color={getNotificationColor(notification.type) as any}
                            size="small"
                          />
                          {!notification.read && (
                            <Chip
                              label="Nuevo"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Te notificaremos cuando haya actualizaciones importantes
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification._id)}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            Marcar como Leída
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedNotification && handleDelete(selectedNotification._id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;
