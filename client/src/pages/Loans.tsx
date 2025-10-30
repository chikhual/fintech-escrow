import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  AccountBalance,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface Loan {
  _id: string;
  loanId: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
  };
  lender: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const Loans: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    principalAmount: '',
    interestRate: '',
    termMonths: '',
    purpose: '',
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/loans');
      setLoans(response.data.data.loans);
    } catch (error: any) {
      console.error('Error cargando préstamos:', error);
      setError('Error al cargar los préstamos');
      showNotification('Error al cargar los préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = () => {
    setFormData({
      principalAmount: '',
      interestRate: '',
      termMonths: '',
      purpose: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLoan(null);
  };

  const handleSubmitLoan = async () => {
    try {
      const loanData = {
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        termMonths: parseInt(formData.termMonths),
        purpose: formData.purpose,
      };

      await axios.post('/loans', loanData);
      showNotification('Solicitud de préstamo creada exitosamente', 'success');
      handleCloseDialog();
      loadLoans();
    } catch (error: any) {
      console.error('Error creando préstamo:', error);
      showNotification('Error al crear la solicitud de préstamo', 'error');
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    try {
      await axios.put(`/loans/${loanId}/approve`);
      showNotification('Préstamo aprobado exitosamente', 'success');
      loadLoans();
    } catch (error: any) {
      console.error('Error aprobando préstamo:', error);
      showNotification('Error al aprobar el préstamo', 'error');
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    try {
      await axios.put(`/loans/${loanId}/reject`, { reason: 'No cumple con los criterios' });
      showNotification('Préstamo rechazado', 'success');
      loadLoans();
    } catch (error: any) {
      console.error('Error rechazando préstamo:', error);
      showNotification('Error al rechazar el préstamo', 'error');
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Préstamos
        </Typography>
        {user?.role === 'borrower' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateLoan}
          >
            Nueva Solicitud
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID del Préstamo</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Tasa de Interés</TableCell>
                  <TableCell>Plazo</TableCell>
                  <TableCell>Pago Mensual</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell>{loan.loanId}</TableCell>
                    <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.termMonths} meses</TableCell>
                    <TableCell>{formatCurrency(loan.monthlyPayment)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(loan.status)}
                        color={getStatusColor(loan.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(loan.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedLoan(loan)}
                      >
                        <Visibility />
                      </IconButton>
                      {user?.role === 'lender' && loan.status === 'pending_approval' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveLoan(loan._id)}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectLoan(loan._id)}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear préstamo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Solicitud de Préstamo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monto del Préstamo"
                type="number"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tasa de Interés (%)"
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plazo (meses)"
                type="number"
                value={formData.termMonths}
                onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Propósito del Préstamo"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmitLoan} variant="contained">
            Crear Solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Loans;
