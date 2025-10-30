import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  Grid,
} from '@mui/material';
import {
  Payment,
  Refresh,
  Visibility,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface PaymentData {
  _id: string;
  paymentId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod: string;
  loan: {
    loanId: string;
    principalAmount: number;
    status: string;
  };
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [formData, setFormData] = useState({
    paymentMethod: 'bank_transfer',
    bankDetails: {
      last4: '',
      bankName: '',
    },
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/payments');
      setPayments(response.data.data.payments);
    } catch (error: any) {
      console.error('Error cargando pagos:', error);
      setError('Error al cargar los pagos');
      showNotification('Error al cargar los pagos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = (payment: PaymentData) => {
    setSelectedPayment(payment);
    setFormData({
      paymentMethod: 'bank_transfer',
      bankDetails: {
        last4: '',
        bankName: '',
      },
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
  };

  const handleSubmitPayment = async () => {
    if (!selectedPayment) return;

    try {
      const paymentData = {
        loanId: selectedPayment.loan._id,
        amount: selectedPayment.amount,
        paymentMethod: formData.paymentMethod,
        bankDetails: formData.bankDetails,
      };

      await axios.post('/payments', paymentData);
      showNotification('Pago procesado exitosamente', 'success');
      handleCloseDialog();
      loadPayments();
    } catch (error: any) {
      console.error('Error procesando pago:', error);
      showNotification('Error al procesar el pago', 'error');
    }
  };

  const handleRetryPayment = async (paymentId: string) => {
    try {
      await axios.put(`/payments/${paymentId}/retry`, {
        paymentMethod: 'bank_transfer',
        bankDetails: {
          last4: '1234',
          bankName: 'Banco Ejemplo',
        },
      });
      showNotification('Reintento de pago iniciado', 'success');
      loadPayments();
    } catch (error: any) {
      console.error('Error reintentando pago:', error);
      showNotification('Error al reintentar el pago', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      case 'debit_card':
        return 'Tarjeta de Débito';
      case 'ach':
        return 'ACH';
      default:
        return method;
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !payments.find(p => p.dueDate === dueDate && p.status === 'completed');
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
          Pagos
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadPayments}
        >
          Actualizar
        </Button>
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
                  <TableCell>ID del Pago</TableCell>
                  <TableCell>Préstamo</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Interés</TableCell>
                  <TableCell>Fecha de Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{payment.loan.loanId}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatCurrency(payment.principalAmount)}</TableCell>
                    <TableCell>{formatCurrency(payment.interestAmount)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {formatDate(payment.dueDate)}
                        {isOverdue(payment.dueDate) && (
                          <Chip
                            label="Vencido"
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(payment.status)}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getPaymentMethodText(payment.paymentMethod)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Visibility />
                      </IconButton>
                      {payment.status === 'pending' && user?.role === 'borrower' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleMakePayment(payment)}
                        >
                          <Payment />
                        </IconButton>
                      )}
                      {payment.status === 'failed' && user?.role === 'borrower' && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleRetryPayment(payment._id)}
                        >
                          <Refresh />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para realizar pago */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Realizar Pago</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Detalles del Pago
                  </Typography>
                  <Typography>Préstamo: {selectedPayment.loan.loanId}</Typography>
                  <Typography>Monto: {formatCurrency(selectedPayment.amount)}</Typography>
                  <Typography>Fecha de Vencimiento: {formatDate(selectedPayment.dueDate)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <MenuItem value="bank_transfer">Transferencia Bancaria</MenuItem>
                      <MenuItem value="credit_card">Tarjeta de Crédito</MenuItem>
                      <MenuItem value="debit_card">Tarjeta de Débito</MenuItem>
                      <MenuItem value="ach">ACH</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.paymentMethod === 'bank_transfer' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Últimos 4 dígitos"
                        value={formData.bankDetails.last4}
                        onChange={(e) => setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, last4: e.target.value }
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre del Banco"
                        value={formData.bankDetails.bankName}
                        onChange={(e) => setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                        })}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmitPayment} variant="contained">
            Procesar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;
