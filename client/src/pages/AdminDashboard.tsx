import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
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
  People,
  AccountBalance,
  Payment,
  Description,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  AdminPanelSettings,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  roleCounts: {
    [key: string]: number;
  };
  totalLoans: number;
  totalAmount: number;
  statusCounts: {
    [key: string]: number;
  };
  totalPayments: number;
  paymentStats: {
    completed: number;
    pending: number;
    failed: number;
  };
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface RecentLoan {
  _id: string;
  loanId: string;
  principalAmount: number;
  status: string;
  borrower: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, loansResponse, paymentsResponse] = await Promise.all([
        axios.get('/users/stats/overview'),
        axios.get('/loans/stats/overview'),
        axios.get('/payments/stats/overview'),
      ]);

      const usersStats = usersResponse.data.data;
      const loansStats = loansResponse.data.data;
      const paymentsStats = paymentsResponse.data.data;

      setStats({
        totalUsers: usersStats.totalUsers,
        activeUsers: usersStats.activeUsers,
        verifiedUsers: usersStats.verifiedUsers,
        roleCounts: usersStats.roleCounts,
        totalLoans: loansStats.totalLoans,
        totalAmount: loansStats.totalAmount,
        statusCounts: loansStats.statusCounts,
        totalPayments: paymentsStats.totals?.totalCount || 0,
        paymentStats: {
          completed: paymentsStats.stats?.find((s: any) => s._id === 'completed')?.count || 0,
          pending: paymentsStats.stats?.find((s: any) => s._id === 'pending')?.count || 0,
          failed: paymentsStats.stats?.find((s: any) => s._id === 'failed')?.count || 0,
        },
      });

      // Cargar usuarios recientes
      const recentUsersResponse = await axios.get('/users?limit=5&sortBy=createdAt&sortOrder=desc');
      setRecentUsers(recentUsersResponse.data.data.users);

      // Cargar préstamos recientes
      const recentLoansResponse = await axios.get('/loans?limit=5&sortBy=createdAt&sortOrder=desc');
      setRecentLoans(recentLoansResponse.data.data.loans);

    } catch (error: any) {
      console.error('Error cargando datos de administración:', error);
      setError('Error al cargar los datos de administración');
      showNotification('Error al cargar los datos de administración', 'error');
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
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pendiente de Aprobación';
      case 'approved':
        return 'Aprobado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'borrower':
        return 'Prestatario';
      case 'lender':
        return 'Prestamista';
      case 'broker':
        return 'Intermediario';
      case 'admin':
        return 'Administrador';
      default:
        return role;
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

  if (!stats) {
    return (
      <Alert severity="error">
        No se pudieron cargar las estadísticas
      </Alert>
    );
  }

  const userRoleData = Object.entries(stats.roleCounts).map(([role, count]) => ({
    name: getRoleText(role),
    value: count,
  }));

  const loanStatusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: getStatusText(status),
    value: count,
  }));

  const paymentStatusData = [
    { name: 'Completados', value: stats.paymentStats.completed },
    { name: 'Pendientes', value: stats.paymentStats.pending },
    { name: 'Fallidos', value: stats.paymentStats.failed },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <AdminPanelSettings sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">
          Panel de Administración
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Resumen" />
        <Tab label="Usuarios" />
        <Tab label="Préstamos" />
        <Tab label="Pagos" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Tarjetas de estadísticas generales */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <People color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Usuarios
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalUsers}
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
                  <AccountBalance color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Préstamos
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalLoans}
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
                      Total Pagos
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalPayments}
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
                  <TrendingUp color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Monto Total
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(stats.totalAmount)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráficos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de Usuarios por Rol
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  Estado de Préstamos
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loanStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Usuarios Recientes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha de Registro</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleText(user.role)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Activo' : 'Inactivo'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Préstamos Recientes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID del Préstamo</TableCell>
                    <TableCell>Prestatario</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLoans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell>{loan.loanId}</TableCell>
                      <TableCell>{loan.borrower.firstName} {loan.borrower.lastName}</TableCell>
                      <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(loan.status)}
                          color={getStatusColor(loan.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(loan.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado de Pagos
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  Resumen de Pagos
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pagos Completados"
                      secondary={stats.paymentStats.completed}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pagos Pendientes"
                      secondary={stats.paymentStats.pending}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pagos Fallidos"
                      secondary={stats.paymentStats.failed}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
