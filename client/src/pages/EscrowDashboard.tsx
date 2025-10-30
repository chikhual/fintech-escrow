import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  Payment,
  LocalShipping,
  CheckCircle,
  Warning,
  Error,
  Add,
  TrendingUp,
  AccountBalance,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface EscrowTransaction {
  _id: string;
  transactionId: string;
  item: {
    title: string;
    category: string;
    condition: string;
    estimatedValue: number;
  };
  terms: {
    price: number;
    currency: string;
    escrowFee: number;
    totalAmount: number;
  };
  status: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  deliveryDate?: string;
  inspectionEndDate?: string;
}

interface DashboardStats {
  totalTransactions: number;
  totalValue: number;
  activeTransactions: number;
  pendingApproval: number;
  completedTransactions: number;
  totalFees: number;
}

const EscrowDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar transacciones
      const response = await axios.get('/escrow/transactions?limit=10&sortBy=createdAt&sortOrder=desc');
      setTransactions(response.data.data.transactions);

      // Calcular estadísticas básicas
      const totalTransactions = response.data.data.pagination.totalTransactions;
      const totalValue = transactions.reduce((sum, t) => sum + t.terms.price, 0);
      const totalFees = transactions.reduce((sum, t) => sum + t.terms.escrowFee, 0);
      const activeTransactions = transactions.filter(t => 
        ['pending_agreement', 'pending_payment', 'payment_received', 'item_shipped', 'inspection_period'].includes(t.status)
      ).length;
      const completedTransactions = transactions.filter(t => t.status === 'transaction_completed').length;
      const pendingApproval = transactions.filter(t => t.status === 'pending_agreement').length;

      setStats({
        totalTransactions,
        totalValue,
        activeTransactions,
        pendingApproval,
        completedTransactions,
        totalFees
      });

    } catch (error: any) {
      console.error('Error cargando datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
      showNotification('Error al cargar los datos del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'transaction_completed':
        return 'success';
      case 'pending_agreement':
        return 'warning';
      case 'pending_payment':
        return 'info';
      case 'payment_received':
        return 'primary';
      case 'item_shipped':
        return 'secondary';
      case 'inspection_period':
        return 'info';
      case 'disputed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_agreement':
        return 'Pendiente de Acuerdo';
      case 'pending_payment':
        return 'Pendiente de Pago';
      case 'payment_received':
        return 'Pago Recibido';
      case 'item_shipped':
        return 'Artículo Enviado';
      case 'inspection_period':
        return 'Período de Inspección';
      case 'buyer_approved':
        return 'Aprobado por Comprador';
      case 'funds_released':
        return 'Fondos Liberados';
      case 'transaction_completed':
        return 'Completado';
      case 'disputed':
        return 'En Disputa';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'transaction_completed':
        return <CheckCircle />;
      case 'pending_agreement':
      case 'pending_payment':
        return <Warning />;
      case 'item_shipped':
        return <LocalShipping />;
      case 'disputed':
        return <Error />;
      default:
        return <Payment />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Dashboard ESCROW
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          href="/escrow/new"
        >
          Nueva Transacción
        </Button>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Bienvenido, {user?.firstName} {user?.lastName} - {user?.role === 'buyer' ? 'Comprador' : 'Vendedor'}
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalance color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Transacciones
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalTransactions || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Valor Total
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats?.totalValue || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Activas
                  </Typography>
                  <Typography variant="h4">
                    {stats?.activeTransactions || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completadas
                  </Typography>
                  <Typography variant="h4">
                    {stats?.completedTransactions || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Transacciones Recientes" />
        <Tab label="Estadísticas" />
        <Tab label="Actividad" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transacciones Recientes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Artículo</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {transaction.item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.item.category} • {transaction.item.condition}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.terms.price, transaction.terms.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(transaction.status)}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                          icon={getStatusIcon(transaction.status)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          href={`/escrow/transactions/${transaction._id}`}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado de Transacciones
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completadas', value: stats.completedTransactions, color: '#4caf50' },
                          { name: 'Activas', value: stats.activeTransactions, color: '#2196f3' },
                          { name: 'Pendientes', value: stats.pendingApproval, color: '#ff9800' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Completadas', value: stats.completedTransactions, color: '#4caf50' },
                          { name: 'Activas', value: stats.activeTransactions, color: '#2196f3' },
                          { name: 'Pendientes', value: stats.pendingApproval, color: '#ff9800' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen Financiero
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Valor Total de Transacciones"
                      secondary={formatCurrency(stats.totalValue)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Payment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Comisiones de ESCROW"
                      secondary={formatCurrency(stats.totalFees)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalance />
                    </ListItemIcon>
                    <ListItemText
                      primary="Promedio por Transacción"
                      secondary={formatCurrency(stats.totalValue / Math.max(stats.totalTransactions, 1))}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <List>
              {transactions.slice(0, 5).map((transaction, index) => (
                <React.Fragment key={transaction._id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(transaction.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${transaction.item.title} - ${getStatusText(transaction.status)}`}
                      secondary={`${formatCurrency(transaction.terms.price)} • ${formatDate(transaction.createdAt)}`}
                    />
                  </ListItem>
                  {index < Math.min(transactions.length, 5) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EscrowDashboard;
