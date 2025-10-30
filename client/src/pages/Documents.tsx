import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
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
  IconButton,
  Divider,
} from '@mui/material';
import {
  Upload,
  Description,
  Download,
  Delete,
  CheckCircle,
  Warning,
  Error,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import axios from 'axios';

interface Document {
  _id: string;
  type: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  description?: string;
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'id',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/documents');
      setDocuments(response.data.data.documents);
    } catch (error: any) {
      console.error('Error cargando documentos:', error);
      setError('Error al cargar los documentos');
      showNotification('Error al cargar los documentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setFormData({
      type: 'id',
      description: '',
    });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) {
      showNotification('Por favor selecciona un archivo', 'error');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('document', selectedFile);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);

      await axios.post('/documents/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showNotification('Documento subido exitosamente', 'success');
      handleCloseDialog();
      loadDocuments();
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      showNotification('Error al subir el documento', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await axios.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error descargando documento:', error);
      showNotification('Error al descargar el documento', 'error');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      await axios.delete(`/documents/${documentId}`);
      showNotification('Documento eliminado exitosamente', 'success');
      loadDocuments();
    } catch (error: any) {
      console.error('Error eliminando documento:', error);
      showNotification('Error al eliminar el documento', 'error');
    }
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
      case 'other':
        return 'Otro';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Warning color="warning" />;
      case 'rejected':
        return <Error color="error" />;
      default:
        return <Description />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
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
          Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleUploadClick}
        >
          Subir Documento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {documents.length > 0 ? (
            <List>
              {documents.map((doc, index) => (
                <React.Fragment key={doc._id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(doc.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getDocumentTypeText(doc.type)}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Archivo: {doc.fileName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Subido: {formatDate(doc.uploadedAt)}
                          </Typography>
                          {doc.description && (
                            <Typography variant="body2" color="text.secondary">
                              Descripción: {doc.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={getStatusText(doc.status)}
                        color={getStatusColor(doc.status) as any}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc._id, doc.fileName)}
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(doc._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < documents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay documentos subidos
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sube tus documentos para completar tu perfil
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={handleUploadClick}
                sx={{ mt: 2 }}
              >
                Subir Primer Documento
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog para subir documento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="id">Identificación</MenuItem>
                  <MenuItem value="proof_of_income">Comprobante de Ingresos</MenuItem>
                  <MenuItem value="bank_statement">Estado de Cuenta</MenuItem>
                  <MenuItem value="employment_letter">Carta de Empleo</MenuItem>
                  <MenuItem value="other">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
              >
                Seleccionar Archivo
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmitUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
