import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  LocalShipping,
  Payment,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const NewEscrowTransaction: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [formData, setFormData] = useState({
    // Información del artículo
    item: {
      title: '',
      description: '',
      category: 'other',
      condition: 'good',
      estimatedValue: '',
    },
    // Términos de la transacción
    terms: {
      price: '',
      currency: 'MXN',
      deliveryMethod: 'shipping',
    },
    // Dirección de entrega
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México',
      instructions: '',
    },
  });

  const steps = [
    'Seleccionar Vendedor',
    'Información del Artículo',
    'Términos de la Transacción',
    'Dirección de Entrega',
    'Revisar y Confirmar',
  ];

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const response = await axios.get('/users?role=seller&limit=50');
      setSellers(response.data.data.users);
    } catch (error: any) {
      console.error('Error cargando vendedores:', error);
      showNotification('Error al cargar la lista de vendedores', 'error');
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('item.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        item: {
          ...prev.item,
          [field]: value,
        },
      }));
    } else if (name.startsWith('terms.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        terms: {
          ...prev.terms,
          [field]: value,
        },
      }));
    } else if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const calculateEscrowFee = (price: number) => {
    return Math.round(price * 0.025 * 100) / 100; // 2.5%
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.terms.price) || 0;
    const escrowFee = calculateEscrowFee(price);
    return price + escrowFee;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return selectedSeller !== '';
      case 1:
        return formData.item.title !== '' && formData.item.description !== '' && formData.item.estimatedValue !== '';
      case 2:
        return formData.terms.price !== '' && parseFloat(formData.terms.price) > 0;
      case 3:
        return formData.deliveryAddress.street !== '' && formData.deliveryAddress.city !== '' && formData.deliveryAddress.state !== '';
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const transactionData = {
        sellerId: selectedSeller,
        item: {
          ...formData.item,
          estimatedValue: parseFloat(formData.item.estimatedValue),
        },
        terms: {
          ...formData.terms,
          price: parseFloat(formData.terms.price),
        },
        deliveryMethod: formData.terms.deliveryMethod,
        deliveryAddress: formData.deliveryAddress,
      };

      await axios.post('/escrow/transactions', transactionData);
      showNotification('Transacción ESCROW creada exitosamente', 'success');
      
      // Redirigir al dashboard
      window.location.href = '/escrow/dashboard';
    } catch (error: any) {
      console.error('Error creando transacción:', error);
      setError('Error al crear la transacción ESCROW');
      showNotification('Error al crear la transacción ESCROW', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Seleccionar Vendedor
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Vendedor</InputLabel>
              <Select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                label="Vendedor"
              >
                {sellers.map((seller) => (
                  <MenuItem key={seller._id} value={seller._id}>
                    {seller.firstName} {seller.lastName} ({seller.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información del Artículo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del Artículo"
                  name="item.title"
                  value={formData.item.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="item.description"
                  value={formData.item.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="item.category"
                    value={formData.item.category}
                    onChange={handleChange}
                    label="Categoría"
                  >
                    <MenuItem value="vehicle">Vehículo</MenuItem>
                    <MenuItem value="machinery">Maquinaria</MenuItem>
                    <MenuItem value="electronics">Electrónicos</MenuItem>
                    <MenuItem value="real_estate">Bienes Raíces</MenuItem>
                    <MenuItem value="jewelry">Joyas</MenuItem>
                    <MenuItem value="art">Arte</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Condición</InputLabel>
                  <Select
                    name="item.condition"
                    value={formData.item.condition}
                    onChange={handleChange}
                    label="Condición"
                  >
                    <MenuItem value="new">Nuevo</MenuItem>
                    <MenuItem value="like_new">Como Nuevo</MenuItem>
                    <MenuItem value="good">Bueno</MenuItem>
                    <MenuItem value="fair">Regular</MenuItem>
                    <MenuItem value="poor">Malo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valor Estimado"
                  name="item.estimatedValue"
                  type="number"
                  value={formData.item.estimatedValue}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Términos de la Transacción
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio de Venta"
                  name="terms.price"
                  type="number"
                  value={formData.terms.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    name="terms.currency"
                    value={formData.terms.currency}
                    onChange={handleChange}
                    label="Moneda"
                  >
                    <MenuItem value="MXN">Peso Mexicano (MXN)</MenuItem>
                    <MenuItem value="USD">Dólar Americano (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Método de Entrega</InputLabel>
                  <Select
                    name="terms.deliveryMethod"
                    value={formData.terms.deliveryMethod}
                    onChange={handleChange}
                    label="Método de Entrega"
                  >
                    <MenuItem value="pickup">Recogida</MenuItem>
                    <MenuItem value="shipping">Envío</MenuItem>
                    <MenuItem value="meetup">Encuentro</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.terms.price && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Resumen de Costos
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Precio de Venta:</Typography>
                      <Typography>{formData.terms.currency} {parseFloat(formData.terms.price).toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Comisión ESCROW (2.5%):</Typography>
                      <Typography>{formData.terms.currency} {calculateEscrowFee(parseFloat(formData.terms.price)).toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Total a Pagar:</Typography>
                      <Typography variant="h6">{formData.terms.currency} {calculateTotal().toLocaleString()}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Dirección de Entrega
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Calle y Número"
                  name="deliveryAddress.street"
                  value={formData.deliveryAddress.street}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="deliveryAddress.state"
                  value={formData.deliveryAddress.state}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Código Postal"
                  name="deliveryAddress.zipCode"
                  value={formData.deliveryAddress.zipCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instrucciones de Entrega (opcional)"
                  name="deliveryAddress.instructions"
                  value={formData.deliveryAddress.instructions}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisar y Confirmar
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información del Artículo
                    </Typography>
                    <Typography><strong>Título:</strong> {formData.item.title}</Typography>
                    <Typography><strong>Descripción:</strong> {formData.item.description}</Typography>
                    <Typography><strong>Categoría:</strong> {formData.item.category}</Typography>
                    <Typography><strong>Condición:</strong> {formData.item.condition}</Typography>
                    <Typography><strong>Valor Estimado:</strong> ${formData.item.estimatedValue}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Términos de la Transacción
                    </Typography>
                    <Typography><strong>Precio:</strong> {formData.terms.currency} {parseFloat(formData.terms.price).toLocaleString()}</Typography>
                    <Typography><strong>Comisión ESCROW:</strong> {formData.terms.currency} {calculateEscrowFee(parseFloat(formData.terms.price)).toLocaleString()}</Typography>
                    <Typography><strong>Total:</strong> {formData.terms.currency} {calculateTotal().toLocaleString()}</Typography>
                    <Typography><strong>Método de Entrega:</strong> {formData.terms.deliveryMethod}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dirección de Entrega
                    </Typography>
                    <Typography>
                      {formData.deliveryAddress.street}, {formData.deliveryAddress.city}, {formData.deliveryAddress.state} {formData.deliveryAddress.zipCode}
                    </Typography>
                    {formData.deliveryAddress.instructions && (
                      <Typography><strong>Instrucciones:</strong> {formData.deliveryAddress.instructions}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Transacción ESCROW
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Crea una nueva transacción segura con protección ESCROW
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {getStepContent(index)}
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={!validateStep(index) || loading}
                      >
                        {index === steps.length - 1 ? 'Crear Transacción' : 'Continuar'}
                        {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Atrás
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewEscrowTransaction;
