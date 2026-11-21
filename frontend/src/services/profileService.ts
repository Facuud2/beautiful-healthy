import apiClient from '../api/axiosConfig';

export interface ProfileData {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  matricula_profesional?: string;
  telefono?: string;
  rol_id: number;
  consultorio_id?: string;
  direccion_consultorio?: string;
  activo: boolean;
  creado_en: string;
}

export interface ProfileUpdateRequest {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  matricula_profesional?: string;
  telefono?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

// Servicio para obtener el perfil del usuario autenticado
export const getProfile = async (): Promise<ProfileData> => {
  try {
    console.log('ProfileService: Haciendo petición a /api/v1/profile');
    const response = await apiClient.get('/api/v1/profile');
    console.log('ProfileService: Respuesta recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('ProfileService: Error al obtener el perfil:', error);
    throw error;
  }
};

// Servicio para actualizar el perfil del usuario
export const updateProfile = async (profileData: ProfileUpdateRequest): Promise<void> => {
  try {
    await apiClient.put('/api/v1/profile', profileData);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
};

// Servicio para cambiar la contraseña
export const changePassword = async (passwordData: PasswordChangeRequest): Promise<void> => {
  try {
    await apiClient.post('/api/v1/profile/change-password', passwordData);
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    throw error;
  }
};
