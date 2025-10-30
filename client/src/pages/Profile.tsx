import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  CreditCard,
  CheckCircle,
  Warning,
  Error,
  Upload,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isIncomeVerified: boolean;
  monthlyIncome: number;
  employmentStatus: string;
  creditScore: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  documents: Array<{
    _id: string;
    type: string;
    fileName: string;
    status: string;
    uploadedAt: string;
  }>;
}

const Profile: React.FC = () => {
  const { user, showNotification } = useAuth();
  const { showNotification: showNotificationToast } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México',
    },
    monthlyIncome: '',
    employmentStatus: 'employed',
    notificationPreferences: {
      email: true,
      sms: true,
      push: true,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/users/profile');
      const userProfile = response.data.data.user;
      setProfile(userProfile);
      
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        address: userProfile.address,
        monthlyIncome: userProfile.monthlyIncome?.toString() || '',
        employmentStatus: userProfile.employmentStatus,
        notificationPreferences: userProfile.notificationPreferences,
      });
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      setError('Error al cargar el perfil');
      showNotificationToast('Error al cargar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
      };

      await axios.put('/users/profile', updateData);
      showNotificationToast('Perfil actualizado exitosamente', 'success');
      setEditMode(false);
      loadProfile();
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      showNotificationToast('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        monthlyIncome: profile.monthlyIncome?.toString() || '',
        employmentStatus: profile.employmentStatus,
        notificationPreferences: profile.notificationPreferences,
      });
    }
    setEditMode(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('notificationPreferences.')) {
      const prefField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefField]: e.target.checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle color="success" />
    ) : (
      <Warning color="warning" />
    );
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? 'Verificado' : 'Pendiente';
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'id':
        return 'Identificación';
      case 'proof_of_income':
        return 'Comprobante de Ingresos';
      case 'bank_statement':
        return 'Estado de Cuenta';
      case 'employment_letter':
        return 'Carta de Empleo';
      default:
        return type;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
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
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        No se pudo cargar el perfil
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Perfil de Usuario
        </Typography>
        <Box>
          {editMode ? (
            <Box>
              <Button onClick={handleCancel} sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : 'Guardar'}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => setEditMode(true)}
            >
              Editar Perfil
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Financiera */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Financiera
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ingreso Mensual"
                    name="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estado de Empleo"
                    name="employmentStatus"
                    select
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="employed">Empleado</option>
                    <option value="self-employed">Autoempleado</option>
                    <option value="unemployed">Desempleado</option>
                    <option value="retired">Jubilado</option>
                    <option value="student">Estudiante</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Puntuación Crediticia: {profile.creditScore || 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Dirección */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dirección
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Calle y Número"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Ciudad"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Código Postal"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de Verificación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Verificación
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {getVerificationIcon(profile.isEmailVerified)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={getVerificationStatus(profile.isEmailVerified)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {getVerificationIcon(profile.isPhoneVerified)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Teléfono"
                    secondary={getVerificationStatus(profile.isPhoneVerified)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {getVerificationIcon(profile.isIdentityVerified)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Identidad"
                    secondary={getVerificationStatus(profile.isIdentityVerified)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {getVerificationIcon(profile.isIncomeVerified)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Ingresos"
                    secondary={getVerificationStatus(profile.isIncomeVerified)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferencias de Notificación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferencias de Notificación
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notificationPreferences.email}
                      onChange={handleChange}
                      name="notificationPreferences.email"
                    />
                  }
                  label="Notificaciones por Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notificationPreferences.sms}
                      onChange={handleChange}
                      name="notificationPreferences.sms"
                    />
                  }
                  label="Notificaciones por SMS"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notificationPreferences.push}
                      onChange={handleChange}
                      name="notificationPreferences.push"
                    />
                  }
                  label="Notificaciones Push"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Documentos
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  size="small"
                >
                  Subir Documento
                </Button>
              </Box>
              {profile.documents.length > 0 ? (
                <List>
                  {profile.documents.map((doc, index) => (
                    <React.Fragment key={doc._id}>
                      <ListItem>
                        <ListItemIcon>
                          <Work />
                        </ListItemIcon>
                        <ListItemText
                          primary={getDocumentTypeText(doc.type)}
                          secondary={`Subido: ${formatDate(doc.uploadedAt)}`}
                        />
                        <Chip
                          label={doc.status}
                          color={getDocumentStatusColor(doc.status) as any}
                          size="small"
                        />
                      </ListItem>
                      {index < profile.documents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay documentos subidos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
