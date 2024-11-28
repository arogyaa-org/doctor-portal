import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useCreateSymptom, useModifySymptom } from '@/hooks/symptoms';

interface FormInModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { id?: number; name: string; description: string }) => void;
  pathKey: string;
  initialData?: { id?: number; name: string; description: string };
}

const FormInModal: React.FC<FormInModalProps> = ({
  open,
  onClose,
  onSubmit,
  pathKey,
  initialData,
}) => {
  const [formData, setFormData] = React.useState({ name: '', description: '' });
  //const [formId, setFormId] = React.useState({ id:'' });
  const [editingSymptomId, setEditingSymptomId] = React.useState<string>();

  const { createSymptom, loading: createLoading, error: createError } = useCreateSymptom();
  const { modifySymptom, loading: modifyLoading, error: modifyError } = useModifySymptom(`/symptoms/update-symptoms/${pathKey}`);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
      });
      setEditingSymptomId(pathKey);
    }
  }, [initialData]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEditSymptom = async () => {
    console.log(editingSymptomId,"sandhya:");
    if (!formData.name.trim() || !formData.description.trim()) {
      console.error('Name and description are required.');
      return;
    }
  
    const updatedSymptomData = { name: formData.name, description: formData.description };
  
    try {
      let response;
      if (editingSymptomId) {
        // Update the existing symptom
        console.log(`/symptoms/update-symptoms/${editingSymptomId}`);

        response = await modifySymptom(`/symptoms/update-symptoms/${editingSymptomId}`, formData);
        console.log('Updated symptom:', response); 
      } else {
        // Create a new symptom
        response = await createSymptom(updatedSymptomData);
        console.log('Created new symptom:', response); 
      }
  
      if (onSubmit) {
        onSubmit({ id: editingSymptomId, ...updatedSymptomData });
      }
  
      console.log('Final submitted data:', updatedSymptomData);
      onClose();
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Error saving the symptom:', err);
    }
  };
  

  const loading = createLoading || modifyLoading;
  const error = createError || modifyError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Avatar sx={{ bgcolor: '#4caf50' }}>
            <AddCircleIcon />
          </Avatar>
          <Typography variant="h5" component="div" fontWeight="bold" color="primary">
            {editingSymptomId ? 'Edit Symptom' : 'Create New Symptom'}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            py: 3,
            px: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #e3f2fd, #e8f5e9)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Stack spacing={3}>
            <TextField
              label="Symptom Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="Enter the symptom name"
              InputLabelProps={{ style: { fontWeight: 600 } }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Provide a detailed description of the symptom"
              InputLabelProps={{ style: { fontWeight: 600 } }}
            />
            {error && (
              <Typography
                color="error"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ErrorOutlineIcon fontSize="small" />
                {error.message}
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', py: 3 }}>
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: 5,
            px: 3,
            py: 1,
            fontSize: '0.875rem',
            borderColor: '#f44336',
            color: '#f44336',
            '&:hover': { backgroundColor: '#ffebee', borderColor: '#f44336' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveEditSymptom}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleIcon />}
          sx={{
            borderRadius: 5,
            px: 3,
            py: 1,
            fontSize: '0.875rem',
            backgroundColor: '#4caf50',
            '&:hover': { backgroundColor: '#388e3c' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormInModal;