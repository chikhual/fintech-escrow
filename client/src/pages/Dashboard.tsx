import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  TrendingUp,
  Notifications,
  Add,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface DashboardStats {
  totalLoans: number;
  totalAmount: number;
  activeLoans: number;
  pendingPayments: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  creditScore: number;
}

interface Loan {
  _id: string;
  loanId: string;
  principalAmount: number;
  status: string;
  monthlyPayment: number;
  createdAt: string;
}

interface Payment {
  _id: string;
  paymentId: string;
  amount: number;
  dueDate: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas
      const [loansResponse, paymentsResponse] = await Promise.all([
        axios.get('/loans/stats/overview'),
        axios.get('/payments/upcoming?days=30'),
      ]);

      const loansStats = loansResponse.data.data;
      const payments = paymentsResponse.data.data.upcomingPayments;

      setStats({
        totalLoans: loansStats.totalLoans || 0,
        totalAmount: loansStats.totalAmount || 0,
        activeLoans: loansStats.statusCounts?.active || 0,
        pendingPayments: payments.length,
        monthlyPayment: payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0),
        nextPaymentDate: payments[0]?.dueDate || '',
        creditScore: user?.creditScore || 0,
      });

      // Cargar préstamos recientes
      const recentLoansResponse = await axios.get('/loans?limit=5&sortBy=createdAt&sortOrder=desc');
      setRecentLoans(recentLoansResponse.data.data.loans);

      setUpcomingPayments(payments.slice(0, 5));

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
      case 'active':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'approved':
        return 'info';
      case 'completed':
        return 'success';
      case 'defaulted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle />;
      case 'pending_approval':
        return <Warning />;
      case 'defaulted':
        return <Error />;
      default:
        return <Notifications />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Bienvenido, {user?.firstName} {user?.lastName}
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalance color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Préstamos
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalLoans || 0}
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
                    Monto Total
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats?.totalAmount || 0)}
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
                    Pagos Pendientes
                  </Typography>
                  <Typography variant="h4">
                    {stats?.pendingPayments || 0}
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
                <Notifications color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Próximo Pago
                  </Typography>
                  <Typography variant="h6">
                    {stats?.nextPaymentDate ? formatDate(stats.nextPaymentDate) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Préstamos recientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Préstamos Recientes</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  size="small"
                >
                  Nuevo Préstamo
                </Button>
              </Box>
              <List>
                {recentLoans.length > 0 ? (
                  recentLoans.map((loan, index) => (
                    <React.Fragment key={loan._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(loan.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${loan.loanId} - ${formatCurrency(loan.principalAmount)}`}
                          secondary={`Estado: ${loan.status} • Creado: ${formatDate(loan.createdAt)}`}
                        />
                        <Chip
                          label={loan.status}
                          color={getStatusColor(loan.status) as any}
                          size="small"
                        />
                      </ListItem>
                      {index < recentLoans.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay préstamos recientes" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos pagos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximos Pagos
              </Typography>
              <List>
                {upcomingPayments.length > 0 ? (
                  upcomingPayments.map((payment, index) => (
                    <React.Fragment key={payment._id}>
                      <ListItem>
                        <ListItemIcon>
                          <Payment />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${payment.paymentId} - ${formatCurrency(payment.amount)}`}
                          secondary={`Vence: ${formatDate(payment.dueDate)}`}
                        />
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status) as any}
                          size="small"
                        />
                      </ListItem>
                      {index < upcomingPayments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay pagos próximos" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de estado de préstamos */}
        {stats && stats.totalLoans > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen de Préstamos
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Activos', value: stats.activeLoans, color: '#4caf50' },
                          { name: 'Pendientes', value: stats.totalLoans - stats.activeLoans, color: '#ff9800' },
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
                          { name: 'Activos', value: stats.activeLoans, color: '#4caf50' },
                          { name: 'Pendientes', value: stats.totalLoans - stats.activeLoans, color: '#ff9800' },
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
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
